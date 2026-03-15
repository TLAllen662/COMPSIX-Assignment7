const express = require("express");
require("dotenv").config();

const { Track, initializeDatabase } = require("./database/setup");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

function validateTrackPayload(payload) {
	const requiredFields = ["songTitle", "artistName", "albumName", "genre"];
	const missingFields = requiredFields.filter((field) => {
		const value = payload[field];
		return typeof value !== "string" || value.trim() === "";
	});

	if (missingFields.length > 0) {
		return {
			isValid: false,
			message: `Missing or invalid required fields: ${missingFields.join(", ")}`
		};
	}

	if (
		payload.duration !== undefined &&
		(!Number.isInteger(payload.duration) || payload.duration < 0)
	) {
		return {
			isValid: false,
			message: "duration must be a non-negative integer."
		};
	}

	if (
		payload.releaseYear !== undefined &&
		!Number.isInteger(payload.releaseYear)
	) {
		return {
			isValid: false,
			message: "releaseYear must be an integer."
		};
	}

	return { isValid: true };
}

app.get("/api/tracks", async (req, res) => {
	try {
		const tracks = await Track.findAll();
		res.status(200).json(tracks);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch tracks." });
	}
});

app.get("/api/tracks/:id", async (req, res) => {
	try {
		const track = await Track.findByPk(req.params.id);

		if (!track) {
			return res.status(404).json({ error: "Track not found." });
		}

		return res.status(200).json(track);
	} catch (error) {
		return res.status(500).json({ error: "Failed to fetch track." });
	}
});

app.post("/api/tracks", async (req, res) => {
	const validation = validateTrackPayload(req.body);

	if (!validation.isValid) {
		return res.status(400).json({ error: validation.message });
	}

	try {
		const track = await Track.create(req.body);
		return res.status(201).json(track);
	} catch (error) {
		return res.status(500).json({ error: "Failed to create track." });
	}
});

app.put("/api/tracks/:id", async (req, res) => {
	const validation = validateTrackPayload(req.body);

	if (!validation.isValid) {
		return res.status(400).json({ error: validation.message });
	}

	try {
		const track = await Track.findByPk(req.params.id);

		if (!track) {
			return res.status(404).json({ error: "Track not found." });
		}

		await track.update(req.body);
		return res.status(200).json(track);
	} catch (error) {
		return res.status(500).json({ error: "Failed to update track." });
	}
});

app.delete("/api/tracks/:id", async (req, res) => {
	try {
		const track = await Track.findByPk(req.params.id);

		if (!track) {
			return res.status(404).json({ error: "Track not found." });
		}

		await track.destroy();
		return res.status(200).json({ message: "Track deleted successfully." });
	} catch (error) {
		return res.status(500).json({ error: "Failed to delete track." });
	}
});

async function startServer() {
	try {
		await initializeDatabase({ closeConnection: false });
		app.listen(port, () => {
			console.log(`Server is running on port ${port}.`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	startServer();
}

module.exports = app;
