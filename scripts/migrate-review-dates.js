// scripts/migrate-review-dates.js
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = 'mongodb+srv://shaheerep121:uaRocsSGTMJXL9Ei@study-flow.dwa7vpj.mongodb.net/';

// Default repetition flow if user doesn't have one
const DEFAULT_REPETITION_FLOW = [2, 4, 7, 7, 7, 30, 30, 30, 130, 130, 130, 365, 365, 365];

// Logging configuration
const LOG_FILE = `migration-log-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
const ERROR_LOG_FILE = `migration-errors-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;

class MigrationLogger {
  constructor() {
    this.logEntries = [];
    this.errorEntries = [];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}`;
    
    console.log(logEntry);
    this.logEntries.push(logEntry);
    
    if (type === 'ERROR' || type === 'WARN') {
      this.errorEntries.push(logEntry);
    }
  }

  error(message, error = null) {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    this.log(errorMessage, 'ERROR');
    if (error && error.stack) {
      this.log(error.stack, 'ERROR');
    }
  }

  warn(message) {
    this.log(message, 'WARN');
  }

  async saveLogs() {
    try {
      await fs.promises.writeFile(LOG_FILE, this.logEntries.join('\n'), 'utf8');
      await fs.promises.writeFile(ERROR_LOG_FILE, this.errorEntries.join('\n'), 'utf8');
      this.log(`Logs saved to ${LOG_FILE} and ${ERROR_LOG_FILE}`);
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  }
}

class ReviewDatesMigrator {
  constructor() {
    this.logger = new MigrationLogger();
    this.stats = {
      totalUsers: 0,
      totalContents: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      skippedContents: 0,
      usersWithoutFlow: 0,
      contentsWithoutUser: 0
    };
  }

  async connect() {
    this.client = new MongoClient(MONGODB_URI);
    await this.client.connect();
    this.logger.log('Successfully connected to MongoDB');
    
    this.testDb = this.client.db('test');
    this.spacedRepetitionDb = this.client.db('spaced_repetition');
    
    this.usersCollection = this.testDb.collection('users');
    this.contentsCollection = this.spacedRepetitionDb.collection('contents');
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.logger.log('Disconnected from MongoDB');
    }
  }

  validateRepetitionFlow(flow) {
    if (!Array.isArray(flow)) {
      return { valid: false, reason: 'Not an array' };
    }
    
    if (flow.length === 0) {
      return { valid: false, reason: 'Empty array' };
    }
    
    for (let i = 0; i < flow.length; i++) {
      if (typeof flow[i] !== 'number' || flow[i] <= 0) {
        return { valid: false, reason: `Invalid value at index ${i}: ${flow[i]}` };
      }
    }
    
    return { valid: true };
  }

  async loadUsers() {
    try {
      this.logger.log('Loading users from test database...');
      
      const users = await this.usersCollection.find({}, {
        projection: { _id: 1, repetitionFlow: 1, email: 1, name: 1 }
      }).toArray();
      
      this.stats.totalUsers = users.length;
      this.logger.log(`Found ${users.length} users in database`);
      
      this.userFlowMap = new Map();
      let validFlowCount = 0;
      
      for (const user of users) {
        const userId = user._id;
        const userIdString = userId.toString();
        
        // Validate and prepare repetition flow
        let repetitionFlow = user.repetitionFlow;
        let flowSource = 'user';
        
        if (!repetitionFlow) {
          repetitionFlow = DEFAULT_REPETITION_FLOW;
          flowSource = 'default';
          this.stats.usersWithoutFlow++;
          this.logger.warn(`User ${userIdString} (${user.email || 'no email'}) has no repetitionFlow, using default`);
        } else {
          const validation = this.validateRepetitionFlow(repetitionFlow);
          if (!validation.valid) {
            repetitionFlow = DEFAULT_REPETITION_FLOW;
            flowSource = 'default_invalid';
            this.stats.usersWithoutFlow++;
            this.logger.warn(`User ${userIdString} has invalid repetitionFlow (${validation.reason}), using default`);
          } else {
            validFlowCount++;
          }
        }
        
        // Store with multiple key formats for flexible lookup
        const userInfo = {
          repetitionFlow,
          flowSource,
          email: user.email,
          name: user.name
        };
        
        this.userFlowMap.set(userIdString, userInfo);
        this.userFlowMap.set(userId, userInfo);
      }
      
      this.logger.log(`Loaded ${validFlowCount} users with valid repetition flows`);
      this.logger.log(`${this.stats.usersWithoutFlow} users using default repetition flow`);
      
    } catch (error) {
      this.logger.error('Failed to load users', error);
      throw error;
    }
  }

  calculateReviewDates(createdAt, repetitionFlow, currentReviewCount = 0) {
    try {
      const reviewDates = [];
      let currentDate = new Date(createdAt);
      
      if (!(currentDate instanceof Date) || isNaN(currentDate)) {
        throw new Error(`Invalid createdAt date: ${createdAt}`);
      }
      
      for (let i = 0; i < repetitionFlow.length; i++) {
        const days = repetitionFlow[i];
        currentDate = new Date(currentDate.getTime() + (days * 24 * 60 * 60 * 1000));
        
        reviewDates.push({
          date: new Date(currentDate),
          completed: i < currentReviewCount,
          interval: days
        });
      }
      
      return reviewDates;
    } catch (error) {
      throw new Error(`Failed to calculate review dates: ${error.message}`);
    }
  }

  determineReviewStage(reviewCount) {
    if (reviewCount < 2) return 'daily';
    if (reviewCount < 5) return 'weekly';
    if (reviewCount < 8) return 'monthly';
    return 'yearly';
  }

  async getUserInfo(userId) {
    // Try direct lookup first
    let userInfo = this.userFlowMap.get(userId);
    if (userInfo) return userInfo;
    
    // If userId is a string, try converting to ObjectId
    if (typeof userId === 'string') {
      try {
        const objectId = new ObjectId(userId);
        userInfo = this.userFlowMap.get(objectId);
        if (userInfo) return userInfo;
      } catch (e) {
        // Not a valid ObjectId string
      }
    }
    
    // If userId is ObjectId, try string version
    if (userId instanceof ObjectId) {
      userInfo = this.userFlowMap.get(userId.toString());
      if (userInfo) return userInfo;
    }
    
    return null;
  }

  async processContent(content) {
    try {
      const contentId = content._id;
      const userId = content.userId;
      
      this.logger.log(`Processing content ${contentId} for user ${userId}`);
      
      // Get user info
      const userInfo = await this.getUserInfo(userId);
      
      if (!userInfo) {
        this.stats.contentsWithoutUser++;
        this.logger.warn(`Content ${contentId}: No user found for userId ${userId}`);
        return { success: false, reason: 'User not found' };
      }
      
      // Check if reviewDates already exists
      if (content.reviewDates && Array.isArray(content.reviewDates) && content.reviewDates.length > 0) {
        this.stats.skippedContents++;
        this.logger.log(`Content ${contentId}: reviewDates already exists, skipping`);
        return { success: false, reason: 'Already has reviewDates' };
      }
      
      // Calculate review dates
      const createdAt = content.createdAt || new Date();
      const reviewCount = content.reviewCount || 0;
      const repetitionFlow = userInfo.repetitionFlow;
      
      const reviewDates = this.calculateReviewDates(createdAt, repetitionFlow, reviewCount);
      const reviewStage = this.determineReviewStage(reviewCount);
      
      // Update document
      const updateData = {
        $set: {
          reviewDates: reviewDates,
          reviewStage: reviewStage
        }
      };
      
      // Remove old fields if they exist
      if (content.nextReviewDate !== undefined || content.reviewCount !== undefined) {
        updateData.$unset = {};
        if (content.nextReviewDate !== undefined) updateData.$unset.nextReviewDate = "";
        if (content.reviewCount !== undefined) updateData.$unset.reviewCount = "";
      }
      
      const updateResult = await this.contentsCollection.updateOne(
        { _id: contentId },
        updateData
      );
      
      if (updateResult.modifiedCount === 1) {
        this.stats.successfulUpdates++;
        this.logger.log(`Content ${contentId}: Successfully updated with ${reviewDates.length} review dates (flow source: ${userInfo.flowSource})`);
        return { success: true };
      } else {
        this.stats.failedUpdates++;
        this.logger.error(`Content ${contentId}: Update failed - no documents modified`);
        return { success: false, reason: 'Update failed - no documents modified' };
      }
      
    } catch (error) {
      this.stats.failedUpdates++;
      this.logger.error(`Content ${content._id}: Processing failed`, error);
      return { success: false, reason: error.message };
    }
  }

  async migrateReviewDates() {
    try {
      await this.connect();
      await this.loadUsers();
      
      this.logger.log('Starting content migration...');
      
      // Get all contents
      const contents = await this.contentsCollection.find({}).toArray();
      this.stats.totalContents = contents.length;
      
      this.logger.log(`Found ${contents.length} content documents to process`);
      
      if (contents.length === 0) {
        this.logger.warn('No content documents found to migrate');
        return;
      }
      
      // Process contents in batches
      const batchSize = 10;
      const totalBatches = Math.ceil(contents.length / batchSize);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, contents.length);
        const batch = contents.slice(startIndex, endIndex);
        
        this.logger.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${startIndex + 1}-${endIndex})`);
        
        for (const content of batch) {
          await this.processContent(content);
        }
        
        // Small delay between batches to avoid overwhelming the database
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      this.printSummary();
      
    } catch (error) {
      this.logger.error('Migration failed', error);
      throw error;
    } finally {
      await this.disconnect();
      await this.logger.saveLogs();
    }
  }

  printSummary() {
    this.logger.log('\n=== MIGRATION SUMMARY ===');
    this.logger.log(`Total users found: ${this.stats.totalUsers}`);
    this.logger.log(`Users without valid repetition flow: ${this.stats.usersWithoutFlow}`);
    this.logger.log(`Total content documents: ${this.stats.totalContents}`);
    this.logger.log(`Successful updates: ${this.stats.successfulUpdates}`);
    this.logger.log(`Failed updates: ${this.stats.failedUpdates}`);
    this.logger.log(`Skipped contents (already had reviewDates): ${this.stats.skippedContents}`);
    this.logger.log(`Contents without matching user: ${this.stats.contentsWithoutUser}`);
    
    const successRate = this.stats.totalContents > 0 
      ? ((this.stats.successfulUpdates / this.stats.totalContents) * 100).toFixed(2)
      : 0;
    
    this.logger.log(`Success rate: ${successRate}%`);
    
    if (this.stats.failedUpdates > 0 || this.stats.contentsWithoutUser > 0) {
      this.logger.warn(`Check ${ERROR_LOG_FILE} for detailed error information`);
    }
    
    this.logger.log('=== END SUMMARY ===\n');
  }
}

// Main execution function
async function migrateReviewDates() {
  const migrator = new ReviewDatesMigrator();
  
  try {
    await migrator.migrateReviewDates();
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] === decodeURI(new URL(import.meta.url).pathname)) {
  migrateReviewDates().catch(console.error);
}

export { migrateReviewDates, ReviewDatesMigrator };