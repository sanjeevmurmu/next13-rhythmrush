/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["misc.scdn.co", "i.scdn.co", "geo-media.beatsource.com", "i1.sndcdn.com", "media.pitchfork.com", "seed-mix-image.spotifycdn.com","nqpiqswzuepilruqgnmf.supabase.co"]
  },
  typescript:{
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
