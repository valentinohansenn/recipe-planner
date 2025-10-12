import "dotenv/config";
import { perplexity } from '@ai-sdk/perplexity';
import { generateText } from 'ai';

interface PerplexitySearchResult {
    content: string;
    sources: string[];
}

/**
 * Search using Perplexity AI SDK for recipe information
 * Uses sonar-pro model with real-time web search
 */
export async function searchWithPerplexity(query: string): Promise<PerplexitySearchResult | null> {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
        console.log('[PERPLEXITY]: API key not found, skipping Perplexity search');
        return null;
    }

    try {
        console.log('[PERPLEXITY]: Searching with sonar for:', query);

        const { text, sources } = await generateText({
            model: perplexity('sonar'), // Fast model with web search
            prompt: `Find recipe info for: ${query}

Provide:
1. Ingredient measurements (metric + volume)
2. Cooking times (prep, cook, chill)
3. Key techniques & temperatures
4. Pro tips

Be concise. Synthesize best practices from top sources.`,
            temperature: 0.3, // Slightly higher for faster generation
        });

        if (!text) {
            console.error('[PERPLEXITY]: No content in response');
            return null;
        }

        // Extract URLs from sources
        const sourceUrls = sources?.map(source => {
            if (source.type === 'source' && source.sourceType === 'url') {
                return source.url;
            }
            return '';
        }).filter(url => url !== '') || [];

        console.log('[PERPLEXITY]: ✓ Generated', text.length, 'chars with', sourceUrls.length, 'sources');

        // Log sources for debugging
        if (sourceUrls.length > 0) {
            console.log('[PERPLEXITY]: Sources:', sourceUrls.slice(0, 3).join(', '));
        }

        return {
            content: text,
            sources: sourceUrls
        };
    } catch (error) {
        console.error('[PERPLEXITY]: Search failed:', error);
        return null;
    }
}

