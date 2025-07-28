#!/usr/bin/env node

import { logger } from './logger.js';
import { MCPWebServer } from './web-server.js';

async function main() {
  console.log('🚀 Starting MCP Bedrock Web Client...');

  // const accessToken = await getAccessToken();
  const port = parseInt(process.env.PORT || '3000', 10);
  const server = new MCPWebServer(port);

  // Handle graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await server.stop();
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    await server.start();
    console.log(`\n🌐 Open your browser and navigate to: http://localhost:${port}`);
    console.log('📖 The web interface provides a user-friendly way to:');
    console.log('   • Configure AWS Bedrock settings');
    console.log('   • Connect to multiple MCP servers');
    console.log('   • Chat with Claude using connected tools');
    console.log('   • Manage conversation history');
    console.log('\n💡 Tip: Make sure your AWS credentials are configured!');
  } catch (error) {
    logger.error('Failed to start web server', error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  logger.error('Fatal error', error);
  process.exit(1);
});
