const path = require("path");
const { Sequelize } = require("sequelize");
require("dotenv").config();

const environment = process.env.NODE_ENV || "development";

// Keep a single place for per-environment database settings.
const databaseConfig = {
	development: {
		dialect: process.env.DB_DIALECT_DEVELOPMENT || "sqlite",
		storage:
			process.env.DB_STORAGE_DEVELOPMENT ||
			path.resolve(__dirname, "music_library.db")
	},
	production: {
		dialect: process.env.DB_DIALECT_PRODUCTION || "sqlite",
		storage:
			process.env.DB_STORAGE_PRODUCTION ||
			path.resolve(__dirname, "music_library.db")
	}
};

const selectedConfig =
	databaseConfig[environment] || databaseConfig.development;

const sequelize = new Sequelize({
	dialect: selectedConfig.dialect,
	storage: selectedConfig.storage,
	logging: false
});

async function initializeDatabase() {
	try {
		await sequelize.authenticate();
		console.log(
			`Connected to SQLite database at ${selectedConfig.storage} (${environment}).`
		);
	} catch (error) {
		console.error("Unable to connect to the database:", error);
		process.exitCode = 1;
	}
}

if (require.main === module) {
	initializeDatabase();
}

module.exports = {
	sequelize,
	databaseConfig,
	initializeDatabase
};
