
const searchLocations = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query || query.length < 2) {
      return res.status(400).json({
        message: "Please enter at least 2 characters.",
      });
    }
    
    const params = new URLSearchParams({
      q: query,
      limit: "10",
      lang: "en",
      countrycode: "MY",
      lat: "1.4927",
      lon: "103.7414",
      zoom: "10",
      location_bias_scale: "0.2",
    });

    const response = await fetch(
      `https://photon.komoot.io/api/?${params}`
    );

    if (!response.ok) {
      throw new Error("Location service unavailable.");
    }

    const data = await response.json();

    const locations = data.features.map((feature) => {
      const p = feature.properties || {};
      const coordinates = feature.geometry?.coordinates || [];

      return {
        name: p.name || p.city || "Unknown location",
        address: [
          p.street,
          p.district,
          p.city,
          p.state,
          p.postcode,
          p.country,
        ]
          .filter(Boolean)
          .join(", "),
        longitude: coordinates[0],
        latitude: coordinates[1],
      };
    });

    return res.status(200).json({ locations });

  } catch (error) {
    console.error("Location search error:", error.message);

    return res.status(502).json({
      message: "Unable to search locations. Please try again.",
    });
  }
};

module.exports = {
  searchLocations,
};
