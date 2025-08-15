const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Fetch TikTok video URL and metadata
async function fetchTikTokVideoMetadata(tiktokUrl) {
    try {
        const { data } = await axios.get(tiktokUrl);
        const $ = cheerio.load(data);
        const videoUrl = $('video').attr('src');
        const title = $("h1").text(); // Adjust based on actual selectors
        const thumbnailUrl = $("video").attr("poster"); // Hypothetical, adjust as needed
        const duration = "00:00"; // Placeholder, fetch if possible
        const author = "TikTok User"; // Placeholder, adjust as necessary
        return { videoUrl, title, duration, thumbnailUrl, author } || null;
    } catch (error) {
        throw new Error("Failed to fetch TikTok video metadata");
    }
}

// Download YouTube video with metadata
async function downloadYouTubeVideo(url) {
    return new Promise((resolve, reject) => {
        youtubedl(url, {
            dumpSingleJson: true,
            output: '%(title)s.%(ext)s',
        }).then(output => {
            resolve({
                status: 'success',
                title: output.title,
                duration: output.duration,
                description: output.description,
                author: output.uploader,
                thumbnailUrl: output.thumbnail,
                download_url: output._filename, // Generated based on title
            });
        }).catch(err => {
            reject(new Error("Failed to fetch YouTube video URL"));
        });
    });
}

// Fetch Instagram video URL and metadata
async function fetchInstagramVideoMetadata(instagramUrl) {
    try {
        const { data } = await axios.get(instagramUrl);
        const $ = cheerio.load(data);
        const videoUrl = $('video').attr('src');
        const title = $("h1").text(); // Adjust based on actual selectors
        const thumbnailUrl = $("video").attr("poster"); // Hypothetical, adjust as needed
        const duration = "00:00"; // Placeholder
        const author = "Instagram User"; // Placeholder
        return { videoUrl, title, duration, thumbnailUrl, author } || null;
    } catch (error) {
        throw new Error("Failed to fetch Instagram video metadata");
    }
}

// Fetch Facebook video URL and metadata
async function fetchFacebookVideoMetadata(facebookUrl) {
    try {
        const { data } = await axios.get(facebookUrl);
        const $ = cheerio.load(data);
        const videoUrl = $('video').attr('src');
        const title = $("h1").text(); // Adjust based on actual selectors
        const thumbnailUrl = $("video").attr("poster"); // Hypothetical, adjust as needed
        const duration = "00:00"; // Placeholder
        const author = "Facebook User"; // Placeholder
        return { videoUrl, title, duration, thumbnailUrl, author } || null;
    } catch (error) {
        throw new Error("Failed to fetch Facebook video metadata");
    }
}

// Video download endpoint
app.post('/download', async (req, res) => {
    const { platform, url } = req.body;

    if (!platform || !url) {
        return res.status(400).json({ error: "Platform and URL are required" });
    }

    try {
        let metadata;

        switch (platform.toLowerCase()) {
            case 'tiktok':
                metadata = await fetchTikTokVideoMetadata(url);
                break;
            case 'youtube':
                metadata = await downloadYouTubeVideo(url);
                break;
            case 'instagram':
                metadata = await fetchInstagramVideoMetadata(url);
                break;
            case 'facebook':
                metadata = await fetchFacebookVideoMetadata(url);
                break;
            default:
                return res.status(400).json({ error: "Unsupported platform" });
        }

        if (!metadata || !metadata.videoUrl) {
            return res.status(404).json({ error: "Video not found or invalid URL" });
        }

        res.json(metadata);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
  
