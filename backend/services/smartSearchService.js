const Product = require('../models/Product');

class SmartSearchService {
  static async intelligentSearch(query) {
    if (!query || query.trim() === '') {
      return await Product.find({ stock: { $gt: 0 } }).limit(20);
    }

    const searchTerm = query.toLowerCase().trim();
    let searchResults = [];

    // 1. Check if it's a price search (number)
    const priceMatch = searchTerm.match(/^\$?(\d+)$/);
    if (priceMatch) {
      const price = parseInt(priceMatch[1]);
      searchResults = await Product.find({
        price: { $gte: price - 50, $lte: price + 50 },
        stock: { $gt: 0 }
      });
      if (searchResults.length > 0) return searchResults;
    }

    // 2. Direct matches (name, category, description)
    searchResults = await Product.find({
      $and: [
        { stock: { $gt: 0 } },
        {
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
          ]
        }
      ]
    });

    if (searchResults.length > 0) return searchResults;

    // 3. AI-powered semantic search
    return await this.semanticSearch(searchTerm);
  }

  static async semanticSearch(query) {
    const allProducts = await Product.find({ stock: { $gt: 0 } });
    
    // Define semantic categories and keywords
    const semanticMap = {
      food: ['snack', 'drink', 'beverage', 'meal', 'nutrition', 'organic', 'fresh'],
      electronics: ['phone', 'laptop', 'computer', 'device', 'tech', 'digital', 'smart'],
      clothing: ['shirt', 'pants', 'dress', 'wear', 'fashion', 'apparel', 'fabric'],
      home: ['furniture', 'decor', 'kitchen', 'bedroom', 'living', 'house', 'room'],
      health: ['medicine', 'vitamin', 'supplement', 'care', 'wellness', 'fitness'],
      beauty: ['cosmetic', 'skincare', 'makeup', 'beauty', 'personal', 'care'],
      sports: ['fitness', 'exercise', 'gym', 'outdoor', 'athletic', 'sport'],
      books: ['book', 'read', 'novel', 'education', 'learning', 'study'],
      toys: ['toy', 'game', 'play', 'kids', 'children', 'fun'],
      automotive: ['car', 'vehicle', 'auto', 'motor', 'drive', 'transport']
    };

    // Find matching products based on semantic similarity
    const matchedProducts = [];
    
    for (const product of allProducts) {
      const productText = `${product.name} ${product.category} ${product.description || ''}`.toLowerCase();
      
      // Check direct word matches
      if (productText.includes(query)) {
        matchedProducts.push({ ...product.toObject(), relevance: 100 });
        continue;
      }

      // Check semantic matches
      for (const [category, keywords] of Object.entries(semanticMap)) {
        if (query.includes(category) || keywords.some(keyword => query.includes(keyword))) {
          if (keywords.some(keyword => productText.includes(keyword)) || 
              productText.includes(category)) {
            matchedProducts.push({ ...product.toObject(), relevance: 80 });
            break;
          }
        }
      }

      // Fuzzy matching for similar words
      const similarity = this.calculateSimilarity(query, productText);
      if (similarity > 0.3) {
        matchedProducts.push({ ...product.toObject(), relevance: similarity * 100 });
      }
    }

    // Sort by relevance and return top results
    return matchedProducts
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20)
      .map(item => {
        const { relevance, ...product } = item;
        return product;
      });
  }

  static calculateSimilarity(str1, str2) {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    let matches = 0;
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.length > 2 && word2.includes(word1)) {
          matches++;
          break;
        }
      }
    }
    
    return matches / Math.max(words1.length, 1);
  }

  static async getSearchSuggestions(query) {
    if (!query || query.length < 2) return [];

    const suggestions = [];
    
    // Get category suggestions
    const categories = await Product.distinct('category');
    const matchingCategories = categories.filter(cat => 
      cat.toLowerCase().includes(query.toLowerCase())
    );
    suggestions.push(...matchingCategories.map(cat => ({ type: 'category', value: cat })));

    // Get product name suggestions
    const products = await Product.find({
      name: { $regex: query, $options: 'i' },
      stock: { $gt: 0 }
    }).limit(5);
    
    suggestions.push(...products.map(p => ({ type: 'product', value: p.name })));

    // Add semantic suggestions
    const semanticSuggestions = this.getSemanticSuggestions(query);
    suggestions.push(...semanticSuggestions);

    return suggestions.slice(0, 8);
  }

  static getSemanticSuggestions(query) {
    const suggestions = [];
    const q = query.toLowerCase();

    if (q.includes('food') || q.includes('eat')) {
      suggestions.push(
        { type: 'semantic', value: 'snacks' },
        { type: 'semantic', value: 'beverages' },
        { type: 'semantic', value: 'organic food' }
      );
    }
    
    if (q.includes('tech') || q.includes('electronic')) {
      suggestions.push(
        { type: 'semantic', value: 'smartphones' },
        { type: 'semantic', value: 'laptops' },
        { type: 'semantic', value: 'gadgets' }
      );
    }

    return suggestions;
  }
}

module.exports = SmartSearchService;