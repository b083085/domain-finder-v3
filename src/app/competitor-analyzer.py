def analyze_domain_structure_improved(words, niche_keywords):
    """Analyze the structure pattern based on word components"""
    # FIX 2: Return user-friendly descriptions without underscores
    if len(words) == 1:
        return "single word"
    elif len(words) == 2:
        # Check what type of two-word combination
        business_suffixes = ['supply', 'direct', 'mart', 'surplus', 'company', 'guys', 
                           'outlet', 'depot', 'pro', 'hub', 'zone']
        if words[1] in business_suffixes:
            return "niche word + business term"
        elif words[0] in ['the', 'all', 'my']:
            return "article + main word"
        else:
            return "two-word combination"
    elif len(words) == 3:
        return "three-word combination"
    elif len(words) >= 4:
        return "multi-word phrase"

    return None

def ai_filter_industry_terms(candidate_words, niche):
    """Use AI to filter out nonsensical fragments and identify real industry terms"""
    try:
        # Prepare candidate list for AI analysis
        word_list = [f"{word} (appears {count} times)" for word, count in candidate_words]
        
        prompt = f"""
You are analyzing competitor domains for the '{niche}' niche. Below are word fragments extracted from domain names.

TASK: Filter out nonsensical fragments and identify only REAL, MEANINGFUL words that are relevant to the {niche} industry.

RULES:
- EXCLUDE: Random letter combinations, partial words, meaningless fragments (like "aun", "sau", "ste", "ter")
- INCLUDE: Real English words relevant to {niche} (like "sauna", "wellness", "therapy", "recovery")
- INCLUDE: Industry-specific terms and product names
- INCLUDE: Common business terms if they make sense for this niche

Candidate words:
{chr(10).join(word_list)}

Return ONLY the valid industry terms as a simple comma-separated list (no explanations):
"""

        response = get_openai_client().chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=200
        )
        
        # Parse AI response
        ai_response = response.choices[0].message.content.strip()
        if ai_response and ai_response.lower() != "none":
            # Extract terms from comma-separated response
            valid_terms = [term.strip() for term in ai_response.split(',') if term.strip()]
            print(f"🤖 AI filtered {len(candidate_words)} candidates → {len(valid_terms)} valid terms")
            return valid_terms
        else:
            print(f"🤖 AI found no valid terms from {len(candidate_words)} candidates")
            return []
            
    except Exception as e:
        print(f"❌ AI filtering failed: {e}")
        # Fallback to basic filtering
        basic_terms = []
        for word, count in candidate_words:
            if len(word) >= 5:  # Only keep longer words as fallback
                basic_terms.append(word)
        return basic_terms[:5]

def fallback_split_domain(domain_name):
    """Fallback domain splitting when AI is unavailable"""
    # Common patterns to help split domains
    common_words = {
        # Backyard/outdoor related
        'fire', 'pit', 'pits', 'bbq', 'barbecue', 'grill', 'porch', 'swing', 'backyard',
        'yard', 'lawn', 'patio', 'garden', 'outdoor', 'deck', 'all', 'things', 'the',
        # Horse-related
        'horse', 'equine', 'saddle', 'saddlery', 'tack', 'bridle', 'riding', 'equestrian',
        'stable', 'ranch', 'barn', 'pony', 'dover', 'chicks', 'smart', 'pak', 'state', 'line',
        # Business-related
        'direct', 'supply', 'depot', 'mart', 'store', 'shop', 'pro', 'hub', 'zone',
        'warehouse', 'factory', 'outlet', 'gear', 'world', 'central', 'place', 'company',
        'guys', 'surplus', 'plus',
        # Descriptors
        'premium', 'quality', 'best', 'top', 'elite', 'master', 'expert', 'global',
        'national', 'american', 'western', 'english', 'online', 'discount', 'wholesale'
    }

    # Convert to lowercase
    name = domain_name.lower()

    # Try to find word boundaries
    words = []
    remaining = name

    while remaining:
        found = False
        # Try to match the longest word first
        for length in range(len(remaining), 0, -1):
            substring = remaining[:length]
            if substring in common_words or (length <= 3 and substring.isalpha()):
                words.append(substring)
                remaining = remaining[length:]
                found = True
                break

        if not found:
            # If no match found, take the first character
            if remaining:
                # Check if we can combine with previous word
                if words and len(words[-1]) < 5 and remaining[0] in 'sz':
                    words[-1] += remaining[0]
                    remaining = remaining[1:]
                else:
                    words.append(remaining[0])
                    remaining = remaining[1:]

    # Clean up single letters that aren't meaningful
    words = [w for w in words if len(w) > 1 or w in ['z', 's']]

    return words if words else [name]

def split_domain_into_words(domain_name):
    """Use AI to intelligently split domain into meaningful words"""
    # Skip OpenAI API for now due to quota issues, use fallback directly
    return fallback_split_domain(domain_name)
    
    try:
        # Use OpenAI to parse the domain
        prompt = f"""Split this domain name into meaningful words based on context and common patterns.

Domain: {domain_name}

Examples of correct splitting:
- firepitsdirect → ["fire", "pits", "direct"]
- bbqguys → ["bbq", "guys"]
- theporchswingcompany → ["the", "porch", "swing", "company"]
- allthingsbarbecue → ["all", "things", "barbecue"]
- doversaddlery → ["dover", "saddlery"]
- smartpakequine → ["smart", "pak", "equine"]
- chicksaddlery → ["chicks", "saddlery"]
- horseloverz → ["horse", "loverz"]
- statelinetack → ["state", "line", "tack"]
- firepitsurplus → ["fire", "pit", "surplus"]

Rules:
1. Identify logical word boundaries based on meaning
2. Common patterns like "direct", "company", "guys", "surplus" should be separate words
3. Keep industry terms together (e.g., "barbecue" not "barbe" + "cue", "saddlery" not "saddle" + "ry")
4. Recognize compound words and split appropriately (e.g., "firepit" can be "fire" + "pit")
5. Keep intentional misspellings together (e.g., "loverz" not "lover" + "z")
6. Common prefixes like "the", "all" should be separate
7. Business suffixes like "direct", "surplus", "company", "guys" should be separate

Output ONLY the words as a Python list, nothing else.
Example output: ["fire", "pits", "direct"]"""

        response = get_openai_client().chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=100
        )

        # Parse the response to extract the list
        result = response.choices[0].message.content.strip()

        # Convert string representation of list to actual list
        import ast
        try:
            words = ast.literal_eval(result)
            if isinstance(words, list):
                # Log the AI parsing for debugging
                print(f"AI parsed '{domain_name}' → {words}")
                return words
        except:
            print(f"Failed to parse AI response: {result}")

    except Exception as e:
        print(f"AI parsing error for {domain_name}: {e}")

    # Fallback to algorithmic parsing if AI fails
    return fallback_split_domain(domain_name)

def extract_niche_keywords(niche):
    """Extract relevant keywords for a niche"""
    niche_keywords = {
        'horse riding': ['horse', 'equine', 'saddle', 'saddlery', 'tack', 'riding', 'equestrian', 
                        'bridle', 'stable', 'ranch', 'cowboy', 'western'],
        'backyard': ['yard', 'lawn', 'patio', 'garden', 'outdoor', 'deck', 'bbq', 'barbecue',
                    'grill', 'fire', 'porch', 'flame'],
        'fireplace': ['fire', 'flame', 'hearth', 'chimney', 'electric', 'stove',
                     'warm', 'heat', 'cozy', 'pit', 'pits'],
        'wellness': ['health', 'wellness', 'vital', 'life', 'care', 'pure', 'recovery',
                    'sauna', 'therapy', 'fitness'],
        'golf': ['golf', 'club', 'simulator', 'indoor', 'swing', 'putt', 'tee'],
        'fitness': ['fitness', 'gym', 'strength', 'warehouse', 'zone', 'factory',
                   'global', 'pro', 'equipment'],
        'kitchen': ['kitchen', 'appliance', 'coffee', 'gear', 'premium', 'range'],
        'sauna': ['sauna', 'spa', 'steam', 'heat', 'finnish', 'infrared', 'heaven'],
        'pizza oven': ['pizza', 'oven', 'wood', 'fire', 'patio', 'outdoor'],
        'drones': ['drone', 'fly', 'maverick', 'nerds', 'uav', 'aviation']
    }

    niche_lower = niche.lower()

    # Find matching keywords
    for key, keywords in niche_keywords.items():
        if key in niche_lower:
            return keywords

    # Default: extract words from niche name
    return niche_lower.split()

def generate_recommendations(niche, patterns):
    """Generate detailed recommendations based on patterns"""
    recommendations = []

    # Length recommendation
    if patterns.get("average_length"):
        recommendations.append(
            f"Keep domain length between {patterns['length_range']['min']}-{patterns['length_range']['max']} characters (average: {patterns['average_length']})"
        )

    # Word count recommendation
    if patterns.get("most_common_word_count"):
        word_count_desc = "single-word" if patterns["most_common_word_count"] == 1 else f"{patterns['most_common_word_count']}-word"
        recommendations.append(
            f"Most successful stores use {word_count_desc} domains"
        )

    # Industry terms recommendation (only if different from common words)
    if patterns.get("industry_terms"):
        terms_str = ", ".join(patterns["industry_terms"][:3])
        recommendations.append(
            f"Consider industry-specific terms: {terms_str}"
        )

    # Common words recommendation (only if there are non-industry common words)
    if patterns.get("common_words") and len(patterns["common_words"]) > 0:
        words_str = ", ".join(patterns["common_words"][:3])
        recommendations.append(
            f"Other frequently used words: {words_str}"
        )

    # Structure recommendations
    if patterns.get("structure_patterns"):
        structure_str = patterns["structure_patterns"][0]
        recommendations.append(
            f"Popular structure: {structure_str}"
        )

    # Brand type recommendation
    if patterns.get("brand_types"):
        brand_str = " and ".join(patterns["brand_types"])  # Changed from "/" to " and "
        recommendations.append(
            f"Brand styles: {brand_str} names work well"
        )

    # Number usage
    if patterns.get("contains_numbers", 0) == 0:
        recommendations.append(
            "Avoid using numbers in your domain"
        )

    return recommendations

def analyze_domain_patterns(domains, niche):
    """Extract detailed patterns from successful domains"""
    patterns = {
        "average_length": 0,
        "length_range": {"min": 0, "max": 0},
        "word_count": {},
        "most_common_word_count": 1,
        "common_words": [],
        "niche_keywords": [],
        "industry_terms": [],
        "suffixes": [],
        "prefixes": [],
        "structure_patterns": [],
        "contains_numbers": 0,
        "brand_types": []
    }

    total_length = 0
    lengths = []
    all_words = []
    all_meaningful_words = []
    niche_related_words = extract_niche_keywords(niche)

    for domain in domains:
        # Remove .com and analyze
        name = domain.replace('.com', '').lower()
        total_length += len(name)
        lengths.append(len(name))

        # Use AI-powered word extraction
        words = split_domain_into_words(name)
        all_words.extend(words)

        # Filter out very short words for meaningful analysis
        meaningful_words = [w for w in words if len(w) > 2]
        all_meaningful_words.extend(meaningful_words)

        # Also track meaningful compound words
        compound_words = []
        if 'fire' in words and ('pit' in words or 'pits' in words):
            compound_words.append('firepit')
        if 'porch' in words and 'swing' in words:
            compound_words.append('porchswing')
        if 'bbq' in words or ('bar' in words and 'b' in words and 'q' in words):
            compound_words.append('bbq')

        all_meaningful_words.extend(compound_words)

        # Count words properly
        word_count = len(words)
        patterns["word_count"][word_count] = patterns["word_count"].get(word_count, 0) + 1

        # Check for numbers
        if any(char.isdigit() for char in name):
            patterns["contains_numbers"] += 1

        # Analyze structure
        structure = analyze_domain_structure_improved(words, niche_related_words)
        if structure:
            patterns["structure_patterns"].append(structure)

    # Calculate statistics
    patterns["average_length"] = total_length // len(domains) if domains else 0
    patterns["length_range"]["min"] = min(lengths) if lengths else 0
    patterns["length_range"]["max"] = max(lengths) if lengths else 0

    # Find most common meaningful words (appearing in 2+ domains)
    word_frequency = Counter(all_meaningful_words)

    # CRITICAL FIX: Be more inclusive about industry terms
    # Only exclude truly generic business terms, not niche words
    generic_business_terms = {'the', 'all', 'my', 'get', 'new', 'best', 'top'}

    # Business suffixes should not be industry terms
    business_suffixes = {'direct', 'company', 'guys', 'pro', 'supply', 'depot', 
                        'mart', 'store', 'shop', 'hub', 'zone', 'outlet', 'surplus'}

    # AI-POWERED INDUSTRY TERM FILTERING
    industry_terms = []
    
    # Get candidate words (appearing 2+ times, 3+ chars)
    candidate_words = []
    for word, count in word_frequency.items():
        if count >= 2 and len(word) >= 3 and word not in business_suffixes:
            candidate_words.append((word, count))
    
    if candidate_words:
        # Use AI to filter out nonsensical fragments
        industry_terms = ai_filter_industry_terms(candidate_words, niche)
        
        for term in industry_terms:
            print(f"✅ AI-validated industry term: '{term}'")
    else:
        print("No candidate words found for AI filtering")

    patterns["industry_terms"] = industry_terms[:10]  # Increased from 5 to show more

    print(f"\n📊 PATTERN ANALYSIS DEBUG:")
    print(f"All meaningful words: {Counter(all_meaningful_words).most_common(10)}")
    print(f"Industry terms found: {industry_terms}")
    print(f"Business suffixes excluded: {business_suffixes}")

    # For common words, exclude industry terms to avoid duplication
    patterns["common_words"] = [
        word for word, count in word_frequency.most_common() 
        if count >= 2 and 
           word not in industry_terms and 
           word not in generic_business_terms and
           word not in business_suffixes
    ][:5]

    # If no common words after filtering, don't show this field at all
    if not patterns["common_words"]:
        patterns["common_words"] = []

    # Find niche-specific keywords actually used
    patterns["niche_keywords"] = list(set([word for word in all_meaningful_words 
                                          if word in niche_related_words]))

    # Most common word count
    if patterns["word_count"]:
        patterns["most_common_word_count"] = max(patterns["word_count"], key=patterns["word_count"].get)

    # Clean up and filter patterns
    patterns["structure_patterns"] = list(set(patterns["structure_patterns"]))[:3]

    # Only show prefixes/suffixes that appear 2+ times
    suffix_counter = Counter()
    prefix_counter = Counter()

    for domain in domains:
        name = domain.replace('.com', '').lower()
        words = split_domain_into_words(name)
        if len(words) > 1:
            # Check last word as suffix
            last_word = words[-1]
            if last_word in business_suffixes:
                suffix_counter[last_word] += 1

            # Check first word as prefix
            first_word = words[0]
            common_prefixes = ['smart', 'pro', 'super', 'best', 'top', 'premium', 'elite', 
                             'the', 'all', 'my', 'total', 'pure', 'prime']
            if first_word in common_prefixes:
                prefix_counter[first_word] += 1

    patterns["suffixes"] = [suffix for suffix, count in suffix_counter.most_common() if count >= 2][:3]
    patterns["prefixes"] = [prefix for prefix, count in prefix_counter.most_common() if count >= 2][:3]

    # Determine brand types based on actual analysis
    brand_types_counter = Counter()
    for domain in domains:
        name = domain.replace('.com', '').lower()
        words = split_domain_into_words(name)

        # Check if it uses industry terms
        if any(term in industry_terms for term in words):
            brand_types_counter['industry-specific'] += 1

        # Check if it's a compound descriptive name
        if len(words) >= 2:
            brand_types_counter['compound'] += 1

        # Check if it's a brandable/invented name
        if len(words) == 1 and words[0] not in all_meaningful_words:
            brand_types_counter['brandable'] += 1

    patterns["brand_types"] = [btype for btype, count in brand_types_counter.most_common() if count >= 2][:3]

    # Debug logging to see what patterns we found
    print(f"\n📊 PATTERN ANALYSIS COMPLETE:")
    print(f"🔍 Industry terms found: {patterns['industry_terms']}")
    print(f"Common words found: {patterns['common_words']}")
    print(f"Suffixes found: {patterns['suffixes']}")
    print(f"Most common word count: {patterns['most_common_word_count']}")

    return patterns