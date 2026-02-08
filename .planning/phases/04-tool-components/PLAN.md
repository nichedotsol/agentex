# Phase 4: Tool Components

## Goal
Create 5 tool component JSON files that define external capabilities following the Tool Component schema from Phase 2.

## Components to Create

### 1. Web Search
**File:** `public/components/tool-web-search.json`

**Key Details:**
- Provider: Brave
- Endpoint: https://api.search.brave.com/res/v1/web/search
- Auth Type: Bearer
- Method: GET
- Required Parameters: q (query)
- Optional Parameters: count, freshness
- Capabilities: web_search, current_information
- Rate Limits: 60 requests/minute, 2000 requests/month
- Icon: 🔍
- Color: #FB542B
- Tags: search, web, information

### 2. Code Execution
**File:** `public/components/tool-code-execution.json`

**Key Details:**
- Provider: E2B
- Endpoint: https://api.e2b.dev/v1/sandboxes
- Auth Type: Bearer
- Method: POST
- Required Parameters: code, language
- Optional Parameters: timeout, packages
- Capabilities: python_execution, sandboxed_environment
- Rate Limits: 30 requests/minute, 60s execution timeout
- Icon: ⚙️
- Color: #3776AB
- Tags: code, execution, python

### 3. Blockchain Query
**File:** `public/components/tool-blockchain-query.json`

**Key Details:**
- Provider: Alchemy
- Endpoint: https://api.alchemy.com/v2
- Auth Type: API Key
- Method: POST
- Required Parameters: method, params
- Optional Parameters: network
- Capabilities: eth_balance, token_balances, transaction_history, nft_metadata
- Rate Limits: 25 requests/second
- Icon: ⛓️
- Color: #627EEA
- Tags: blockchain, crypto, ethereum, solana

### 4. Token Price Feed
**File:** `public/components/tool-token-price.json`

**Key Details:**
- Provider: CoinGecko
- Endpoint: https://api.coingecko.com/api/v3
- Auth Type: API Key
- Method: GET
- Required Parameters: ids
- Optional Parameters: vs_currencies, include_24hr_change
- Capabilities: price_data, market_cap, volume, price_change
- Rate Limits: 50 requests/minute
- Icon: 💰
- Color: #8DC647
- Tags: crypto, prices, market-data

### 5. Twitter Post
**File:** `public/components/tool-twitter-post.json`

**Key Details:**
- Provider: Twitter
- Endpoint: https://api.twitter.com/2/tweets
- Auth Type: Bearer
- Method: POST
- Required Parameters: text
- Optional Parameters: media_ids, reply_settings
- Capabilities: post_tweet, reply_to_tweet, attach_media
- Rate Limits: 50 requests/15 minutes
- Icon: 🐦
- Color: #1DA1F2
- Tags: social, twitter, posting

## Implementation Steps

1. **Create tool-web-search.json**
   - Follow Tool Component schema
   - Include all required fields (id, type, name, version, provider)
   - Configure endpoint, auth_type, method
   - Define parameters (required: q, optional: count, freshness)
   - Define interface with inputs/outputs/capabilities
   - Add resources (rate_limits)
   - Add metadata (author, description, tags, icon, color)

2. **Create tool-code-execution.json**
   - Follow Tool Component schema
   - Configure for E2B provider
   - Set appropriate parameters and capabilities
   - Add metadata

3. **Create tool-blockchain-query.json**
   - Follow Tool Component schema
   - Configure for Alchemy provider
   - Set appropriate parameters and capabilities
   - Add metadata

4. **Create tool-token-price.json**
   - Follow Tool Component schema
   - Configure for CoinGecko provider
   - Set appropriate parameters and capabilities
   - Add metadata

5. **Create tool-twitter-post.json**
   - Follow Tool Component schema
   - Configure for Twitter provider
   - Set appropriate parameters and capabilities
   - Add metadata

## Schema Compliance
All components must include:
- ✅ id (unique identifier)
- ✅ type: "tool"
- ✅ name, version, provider
- ✅ config (endpoint, auth_type, method, parameters)
- ✅ interface (inputs, outputs, capabilities)
- ✅ resources (rate_limits)
- ✅ metadata (author, description, tags, icon, color)

## Success Criteria
- [ ] All 5 tool component JSON files created
- [ ] All files follow Tool Component schema exactly
- [ ] All required fields populated
- [ ] JSON is valid and properly formatted
- [ ] Files are ready for component registry (Phase 6)

## Dependencies
- Phase 2 must be complete (schemas defined)

## Notes
- These components will be referenced in the component registry (Phase 6)
- All tools require API keys/tokens for authentication
- Rate limits are important for cost and usage planning
- Each tool has specific use cases and capabilities
