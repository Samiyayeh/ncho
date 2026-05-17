import sequelize from './config/db';
import fs from 'fs';
import path from 'path';

async function cleanup() {
  console.log('--- 🧹 Starting System Cleanup ---');

  try {
    // 1. Reset the Database
    await sequelize.authenticate();
    console.log('Connected to database.');

    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized with force: true. All tables dropped and re-created completely blank.');

    // 2. Clean Up Upload Directories
    const uploadDirs = [
      path.join(__dirname, 'uploads'),
      path.join(__dirname, 'uploads', 'ids')
    ];

    for (const dir of uploadDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isFile()) {
            if (file === '.gitkeep') {
              continue; // Keep gitkeeps so folders are tracked in git
            }
            fs.unlinkSync(filePath);
            console.log(`🗑️ Deleted file: ${path.relative(__dirname, filePath)}`);
          }
        }
      }
    }
    console.log('✅ Uploads directory cleaned successfully.');
    console.log('--- 🏁 Cleanup Completed Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
