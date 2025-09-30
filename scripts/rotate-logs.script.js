/**
 * Log Rotation and Cleanup System
 * 
 * Purpose:
 * - Rotate log files when they get too large
 * - Compress old log files
 * - Delete very old log files
 * - Keep logs directory clean and manageable
 * 
 * Features:
 * - Automatic rotation based on file size or age
 * - Compression of old logs to save disk space
 * - Configurable retention period
 * - Can be run manually or scheduled
 * 
 * Usage:
 * - Run manually: node scripts/rotate-logs.script.js
 * - Or schedule with cron/task scheduler
 * 
 * @module log-rotation
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Configuration
const CONFIG = {
  LOGS_DIR: path.join(__dirname, '../data/logs'),
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_AGE_DAYS: 30, // Keep logs for 30 days
  COMPRESS_AFTER_DAYS: 7, // Compress logs older than 7 days
  LOG_EXTENSIONS: ['.log'],
  BACKUP_EXTENSION: '.old',
  COMPRESSED_EXTENSION: '.gz'
};

/**
 * Get file age in days
 * @param {string} filePath - Path to file
 * @returns {Promise<number>} Age in days
 */
async function getFileAgeDays(filePath) {
  try {
    const stats = await stat(filePath);
    const ageMs = Date.now() - stats.mtime.getTime();
    return ageMs / (1000 * 60 * 60 * 24); // Convert to days
  } catch (error) {
    console.error(`Error getting file age for ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Get file size in bytes
 * @param {string} filePath - Path to file
 * @returns {Promise<number>} File size in bytes
 */
async function getFileSize(filePath) {
  try {
    const stats = await stat(filePath);
    return stats.size;
  } catch (error) {
    console.error(`Error getting file size for ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Compress a log file using gzip
 * @param {string} filePath - Path to file to compress
 * @returns {Promise<boolean>} Success status
 */
async function compressFile(filePath) {
  try {
    console.log(`Compressing file: ${filePath}`);
    
    const fileContent = await readFile(filePath);
    const compressed = zlib.gzipSync(fileContent);
    const compressedPath = `${filePath}${CONFIG.COMPRESSED_EXTENSION}`;
    
    await writeFile(compressedPath, compressed);
    await unlink(filePath); // Delete original after compression
    
    console.log(`✓ File compressed successfully: ${compressedPath}`);
    return true;
  } catch (error) {
    console.error(`✗ Error compressing file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Rotate a log file by renaming it with timestamp
 * @param {string} filePath - Path to file to rotate
 * @returns {Promise<boolean>} Success status
 */
async function rotateFile(filePath) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    const newPath = path.join(dir, `${baseName}-${timestamp}${ext}`);
    
    console.log(`Rotating file: ${filePath} -> ${newPath}`);
    
    await rename(filePath, newPath);
    
    console.log(`✓ File rotated successfully`);
    return true;
  } catch (error) {
    console.error(`✗ Error rotating file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Delete old log files
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} Success status
 */
async function deleteOldFile(filePath) {
  try {
    console.log(`Deleting old file: ${filePath}`);
    await unlink(filePath);
    console.log(`✓ File deleted successfully`);
    return true;
  } catch (error) {
    console.error(`✗ Error deleting file ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Process all log files in the logs directory
 */
async function processLogs() {
  try {
    console.log('\n=== Log Rotation Process Started ===\n');
    console.log(`Logs directory: ${CONFIG.LOGS_DIR}`);
    
    // Ensure logs directory exists
    if (!fs.existsSync(CONFIG.LOGS_DIR)) {
      console.log('Logs directory does not exist. Nothing to process.');
      return;
    }
    
    // Get all files in logs directory
    const files = await readdir(CONFIG.LOGS_DIR);
    
    let rotatedCount = 0;
    let compressedCount = 0;
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(CONFIG.LOGS_DIR, file);
      const ext = path.extname(file);
      
      // Skip non-log files
      if (!CONFIG.LOG_EXTENSIONS.includes(ext) && ext !== CONFIG.COMPRESSED_EXTENSION) {
        continue;
      }
      
      // Get file info
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) continue;
      
      const fileAge = await getFileAgeDays(filePath);
      const fileSize = await getFileSize(filePath);
      
      console.log(`\nProcessing: ${file}`);
      console.log(`  Size: ${(fileSize / 1024).toFixed(2)} KB`);
      console.log(`  Age: ${fileAge.toFixed(1)} days`);
      
      // Delete very old files (including compressed)
      if (fileAge > CONFIG.MAX_AGE_DAYS) {
        if (await deleteOldFile(filePath)) {
          deletedCount++;
        }
        continue;
      }
      
      // Compress old uncompressed files
      if (ext !== CONFIG.COMPRESSED_EXTENSION && fileAge > CONFIG.COMPRESS_AFTER_DAYS) {
        if (await compressFile(filePath)) {
          compressedCount++;
        }
        continue;
      }
      
      // Rotate large active log files (not compressed or timestamped)
      if (ext === '.log' && !file.includes('-') && fileSize > CONFIG.MAX_FILE_SIZE) {
        if (await rotateFile(filePath)) {
          rotatedCount++;
        }
      }
    }
    
    console.log('\n=== Log Rotation Process Completed ===');
    console.log(`Files rotated: ${rotatedCount}`);
    console.log(`Files compressed: ${compressedCount}`);
    console.log(`Files deleted: ${deletedCount}`);
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('Error during log rotation:', error);
  }
}

/**
 * Get log statistics
 */
async function getLogStats() {
  try {
    if (!fs.existsSync(CONFIG.LOGS_DIR)) {
      return {
        totalFiles: 0,
        totalSize: 0,
        activeFiles: 0,
        compressedFiles: 0,
        oldestFile: null,
        newestFile: null
      };
    }
    
    const files = await readdir(CONFIG.LOGS_DIR);
    let totalSize = 0;
    let activeFiles = 0;
    let compressedFiles = 0;
    let oldestDate = null;
    let newestDate = null;
    
    for (const file of files) {
      const filePath = path.join(CONFIG.LOGS_DIR, file);
      const fileStat = await stat(filePath);
      
      if (!fileStat.isFile()) continue;
      
      totalSize += fileStat.size;
      
      if (path.extname(file) === CONFIG.COMPRESSED_EXTENSION) {
        compressedFiles++;
      } else if (CONFIG.LOG_EXTENSIONS.includes(path.extname(file))) {
        activeFiles++;
      }
      
      const mtime = fileStat.mtime;
      if (!oldestDate || mtime < oldestDate) oldestDate = mtime;
      if (!newestDate || mtime > newestDate) newestDate = mtime;
    }
    
    return {
      totalFiles: files.length,
      totalSize: (totalSize / (1024 * 1024)).toFixed(2) + ' MB',
      activeFiles,
      compressedFiles,
      oldestFile: oldestDate ? oldestDate.toISOString().split('T')[0] : 'N/A',
      newestFile: newestDate ? newestDate.toISOString().split('T')[0] : 'N/A'
    };
  } catch (error) {
    console.error('Error getting log stats:', error);
    return null;
  }
}

// Export functions
module.exports = {
  processLogs,
  getLogStats,
  compressFile,
  rotateFile,
  deleteOldFile
};

// Run if called directly
if (require.main === module) {
  (async () => {
    await processLogs();
    
    // Show stats after rotation
    const stats = await getLogStats();
    if (stats) {
      console.log('\nCurrent Log Statistics:');
      console.log(`  Total files: ${stats.totalFiles}`);
      console.log(`  Total size: ${stats.totalSize}`);
      console.log(`  Active log files: ${stats.activeFiles}`);
      console.log(`  Compressed files: ${stats.compressedFiles}`);
      console.log(`  Oldest file: ${stats.oldestFile}`);
      console.log(`  Newest file: ${stats.newestFile}`);
    }
  })();
}
