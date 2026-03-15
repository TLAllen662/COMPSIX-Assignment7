const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
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

const Track = sequelize.define(
	"Track",
	{
		trackId: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		songTitle: {
			type: DataTypes.STRING,
			allowNull: false
		},
		artistName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		albumName: {
			type: DataTypes.STRING,
			allowNull: false
		},
		genre: {
			type: DataTypes.STRING,
			allowNull: false
		},
		duration: {
			type: DataTypes.INTEGER
		},
		releaseYear: {
			type: DataTypes.INTEGER
		}
	},
	{
		tableName: "tracks",
		timestamps: false
	}
);

async function initializeDatabase({ closeConnection = true } = {}) {
	try {
		await sequelize.authenticate();
		await sequelize.sync();
		console.log(
			`Connected to SQLite database at ${selectedConfig.storage} (${environment}).`
		);
		console.log("Tracks table is ready.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
		process.exitCode = 1;
	} finally {
		if (closeConnection) {
			await sequelize.close();
			console.log("Database connection closed.");
		}
	}
}

if (require.main === module) {
	initializeDatabase();
}

module.exports = {
	sequelize,
	Track,
	databaseConfig,
	initializeDatabase
};
