
const searchLocations = async (req, res) => {
  try {
    const query = req.query.q?.trim();

    // Validate search input
    if (!query || query.length < 2) {
      return res.status(400).json({
        message: 'Please enter at least 2 characters.',
      });
    }

    // Build Photon API request
    const params = new URLSearchParams({
      q: query,
      limit: '6',
      lang: 'en',
      countrycode: 'MY',
    });

    const response = await fetch(
      `https://photon.komoot.io/api/?${params}`
    );

    if (!response.ok) {
      throw new Error('Location service unavailable.');
    }

    const data = await response.json();

    // Format location results
    const locations = data.features.map((feature) => {
      const p = feature.properties || {};
      const coordinates = feature.geometry?.coordinates || [];

      return {
        name: p.name || p.city || 'Unknown location',
        address: [
          p.street,
          p.district,
          p.city,
          p.state,
          p.postcode,
          p.country,
        ].filter(Boolean).join(', '),
        longitude: coordinates[0],
        latitude: coordinates[1],
      };
    });

    res.status(200).json({ locations });

  } catch (error) {
    console.error('Location search error:', error.message);

    res.status(502).json({
      message: 'Unable to search locations. Please try again.',
    });
  }
};

module.exports = {
  searchLocations,
};
