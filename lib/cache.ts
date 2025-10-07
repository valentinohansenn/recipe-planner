// import { createCacheBackend, createCachedFunction } from '@ai-sdk-tools/cache/'
// import Redis from 'redis';

// // Environment-aware cache backend
// const backend = process.env.REDIS_URL
//     ? createCacheBackend({
//         type: 'redis',
//         defaultTTL: 60 * 60 * 1000, // 1 hour for recipes
//         redis: {
//             client: Redis.createClient({
//                 url: process.env.REDIS_URL
//             }),
//             keyPrefix: 'recipe-chef:' // Namespace your cache keys
//         }
//     })
//     : createCacheBackend({
//         type: 'lru',
//         maxSize: 100, // Cache up to 100 recipes in memory
//         defaultTTL: 30 * 60 * 1000 // 30 minutes for dev
//     });

// // Export pre-configured cache function
// export const cached = createCachedFunction(backend);
