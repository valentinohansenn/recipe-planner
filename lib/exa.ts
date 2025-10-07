import "dotenv/config";
import Exa from "exa-js"

export const exa = new Exa(process.env.EXASEARCH_API_KEY);
