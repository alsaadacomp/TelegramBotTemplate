/**
 * Section Model
 * Defines section schema and provides section-related database operations
 * Used for storing section metadata and state
 * 
 * @module models/section
 */

/**
 * Section Model Class
 */
class SectionModel {
  constructor(dbService) {
    this.db = dbService;
    this.tableName = 'sections';
  }

  // ========================================
  // Table Schema
  // ========================================

  /**
   * Get table schema definition
   * @returns {Object} Schema definition
   */
  static getSchema() {
    return {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      section_id: 'TEXT UNIQUE NOT NULL', // من ملف JSON (e.g., "sales", "reports")
      name: 'TEXT NOT NULL',
      name_ar: 'TEXT',
      name_en: 'TEXT',
      type: 'TEXT NOT NULL', // 'main', 'sub', 'action'
      parent_id: 'TEXT', // ID القسم الأب
      icon: 'TEXT',
      order_index: 'INTEGER DEFAULT 0', // ✅ تم التغيير من order إلى order_index
      enabled: 'INTEGER DEFAULT 1',
      visible: 'INTEGER DEFAULT 1',
      workflow_id: 'TEXT', // ربط بـ workflow
      handler: 'TEXT', // اسم الـ handler
      permissions: 'TEXT', // JSON array of roles
      metadata: 'TEXT', // JSON - بيانات إضافية
      view_count: 'INTEGER DEFAULT 0',
      last_accessed: 'TEXT',
      created_at: 'TEXT NOT NULL',
      updated_at: 'TEXT',
    };
  }

  /**
   * Get default values for new section
   * @returns {Object} Default values
   */
  static getDefaults() {
    return {
      type: 'main',
      order_index: 0, // ✅ تم التغيير من order إلى order_index
      enabled: 1,
      visible: 1,
      view_count: 0,
      created_at: new Date().toISOString(),
    };
  }

  // ========================================
  // Table Initialization
  // ========================================

  /**
   * Initialize sections table
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await this.db.createTable(this.tableName, SectionModel.getSchema());
      console.log('SectionModel: Table initialized');
    } catch (error) {
      console.error('SectionModel: Failed to initialize table:', error);
      throw error;
    }
  }

  // ========================================
  // CRUD Operations
  // ========================================

  /**
   * Create new section
   * @param {Object} sectionData - Section data
   * @returns {Promise<Object>} Created section
   */
  async create(sectionData) {
    try {
      const data = {
        ...SectionModel.getDefaults(),
        ...sectionData,
        created_at: new Date().toISOString(),
      };

      // Convert arrays/objects to JSON strings
      if (data.permissions && typeof data.permissions !== 'string') {
        data.permissions = JSON.stringify(data.permissions);
      }
      if (data.metadata && typeof data.metadata !== 'string') {
        data.metadata = JSON.stringify(data.metadata);
      }

      const section = await this.db.create(this.tableName, data);
      console.log(`SectionModel: Section created - ID: ${section.section_id}`);
      
      return this._parseSection(section);
    } catch (error) {
      console.error('SectionModel: Failed to create section:', error);
      throw error;
    }
  }

  /**
   * Find sections by criteria
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Sections array
   */
  async find(criteria = {}, options = {}) {
    try {
      const sections = await this.db.find(this.tableName, criteria, options);
      return sections.map(section => this._parseSection(section));
    } catch (error) {
      console.error('SectionModel: Failed to find sections:', error);
      throw error;
    }
  }

  /**
   * Find section by ID
   * @param {number} id - Database ID
   * @returns {Promise<Object|null>} Section or null
   */
  async findById(id) {
    try {
      const section = await this.db.findById(this.tableName, id);
      return section ? this._parseSection(section) : null;
    } catch (error) {
      console.error('SectionModel: Failed to find section by ID:', error);
      throw error;
    }
  }

  /**
   * Find section by section_id
   * @param {string} sectionId - Section ID from JSON
   * @returns {Promise<Object|null>} Section or null
   */
  async findBySectionId(sectionId) {
    try {
      const section = await this.db.findOne(this.tableName, { section_id: sectionId });
      return section ? this._parseSection(section) : null;
    } catch (error) {
      console.error('SectionModel: Failed to find section by section_id:', error);
      throw error;
    }
  }

  /**
   * Update section
   * @param {number} id - Database ID
   * @param {Object} data - Data to update
   * @returns {Promise<boolean>} Success status
   */
  async update(id, data) {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      // Convert arrays/objects to JSON strings
      if (updateData.permissions && typeof updateData.permissions !== 'string') {
        updateData.permissions = JSON.stringify(updateData.permissions);
      }
      if (updateData.metadata && typeof updateData.metadata !== 'string') {
        updateData.metadata = JSON.stringify(updateData.metadata);
      }

      const success = await this.db.updateById(this.tableName, id, updateData);
      
      if (success) {
        console.log(`SectionModel: Section updated - ID: ${id}`);
      }
      
      return success;
    } catch (error) {
      console.error('SectionModel: Failed to update section:', error);
      throw error;
    }
  }

  /**
   * Update section by section_id
   * @param {string} sectionId - Section ID
   * @param {Object} data - Data to update
   * @returns {Promise<number>} Number of updated records
   */
  async updateBySectionId(sectionId, data) {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      // Convert arrays/objects to JSON strings
      if (updateData.permissions && typeof updateData.permissions !== 'string') {
        updateData.permissions = JSON.stringify(updateData.permissions);
      }
      if (updateData.metadata && typeof updateData.metadata !== 'string') {
        updateData.metadata = JSON.stringify(updateData.metadata);
      }

      return await this.db.update(this.tableName, { section_id: sectionId }, updateData);
    } catch (error) {
      console.error('SectionModel: Failed to update section by section_id:', error);
      throw error;
    }
  }

  /**
   * Delete section
   * @param {number} id - Database ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id) {
    try {
      return await this.db.deleteById(this.tableName, id);
    } catch (error) {
      console.error('SectionModel: Failed to delete section:', error);
      throw error;
    }
  }

  /**
   * Delete section by section_id
   * @param {string} sectionId - Section ID
   * @returns {Promise<number>} Number of deleted records
   */
  async deleteBySectionId(sectionId) {
    try {
      return await this.db.delete(this.tableName, { section_id: sectionId });
    } catch (error) {
      console.error('SectionModel: Failed to delete section by section_id:', error);
      throw error;
    }
  }

  /**
   * Count sections by criteria
   * @param {Object} criteria - Search criteria
   * @returns {Promise<number>} Number of sections
   */
  async count(criteria = {}) {
    try {
      return await this.db.count(this.tableName, criteria);
    } catch (error) {
      console.error('SectionModel: Failed to count sections:', error);
      throw error;
    }
  }

  // ========================================
  // Section-Specific Operations
  // ========================================

  /**
   * Get all enabled sections
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Enabled sections
   */
  async getEnabled(options = {}) {
    return await this.find({ enabled: 1 }, options);
  }

  /**
   * Get all visible sections
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Visible sections
   */
  async getVisible(options = {}) {
    return await this.find({ enabled: 1, visible: 1 }, options);
  }

  /**
   * Get sections by type
   * @param {string} type - Section type ('main', 'sub', 'action')
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Sections of specified type
   */
  async getByType(type, options = {}) {
    return await this.find({ type, enabled: 1 }, options);
  }

  /**
   * Get child sections of a parent
   * @param {string} parentId - Parent section ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Child sections
   */
  async getChildren(parentId, options = {}) {
    return await this.find(
      { parent_id: parentId, enabled: 1 },
      { ...options, orderBy: 'order_index', orderDirection: 'ASC' } // ✅ تم التغيير
    );
  }

  /**
   * Get main sections (no parent)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Main sections
   */
  async getMainSections(options = {}) {
    try {
      const sections = await this.db.raw(
        `SELECT * FROM ${this.tableName} 
         WHERE (parent_id IS NULL OR parent_id = '') AND enabled = 1
         ORDER BY order_index ASC`, // ✅ تم التغيير
        []
      );
      
      return sections.map(section => this._parseSection(section));
    } catch (error) {
      console.error('SectionModel: Failed to get main sections:', error);
      throw error;
    }
  }

  /**
   * Increment view count
   * @param {string} sectionId - Section ID
   * @returns {Promise<number>} Number of updated records
   */
  async incrementViewCount(sectionId) {
    try {
      const section = await this.findBySectionId(sectionId);
      if (!section) return 0;

      return await this.updateBySectionId(sectionId, {
        view_count: (section.view_count || 0) + 1,
        last_accessed: new Date().toISOString(),
      });
    } catch (error) {
      console.error('SectionModel: Failed to increment view count:', error);
      throw error;
    }
  }

  /**
   * Enable section
   * @param {string} sectionId - Section ID
   * @returns {Promise<number>} Number of updated records
   */
  async enable(sectionId) {
    return await this.updateBySectionId(sectionId, { enabled: 1 });
  }

  /**
   * Disable section
   * @param {string} sectionId - Section ID
   * @returns {Promise<number>} Number of updated records
   */
  async disable(sectionId) {
    return await this.updateBySectionId(sectionId, { enabled: 0 });
  }

  /**
   * Show section (make visible)
   * @param {string} sectionId - Section ID
   * @returns {Promise<number>} Number of updated records
   */
  async show(sectionId) {
    return await this.updateBySectionId(sectionId, { visible: 1 });
  }

  /**
   * Hide section (make invisible)
   * @param {string} sectionId - Section ID
   * @returns {Promise<number>} Number of updated records
   */
  async hide(sectionId) {
    return await this.updateBySectionId(sectionId, { visible: 0 });
  }

  /**
   * Update section order_index
   * @param {string} sectionId - Section ID
   * @param {number} orderIndex - New order_index
   * @returns {Promise<number>} Number of updated records
   */
  async updateOrder(sectionId, orderIndex) { // ✅ تم التغيير
    return await this.updateBySectionId(sectionId, { order_index: orderIndex });
  }

  /**
   * Get section statistics
   * @returns {Promise<Object>} Section statistics
   */
  async getStatistics() {
    try {
      const total = await this.count();
      const enabled = await this.count({ enabled: 1 });
      const visible = await this.count({ enabled: 1, visible: 1 });
      const mainSections = await this.count({ parent_id: null, enabled: 1 });

      return {
        total,
        enabled,
        visible,
        disabled: total - enabled,
        mainSections,
        subSections: enabled - mainSections,
      };
    } catch (error) {
      console.error('SectionModel: Failed to get statistics:', error);
      throw error;
    }
  }

  /**
   * Search sections by name
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching sections
   */
  async search(query) {
    try {
      const searchPattern = `%${query}%`;
      
      const sections = await this.db.raw(
        `SELECT * FROM ${this.tableName} 
         WHERE (name LIKE ? OR name_ar LIKE ? OR name_en LIKE ?) AND enabled = 1`,
        [searchPattern, searchPattern, searchPattern]
      );
      
      return sections.map(section => this._parseSection(section));
    } catch (error) {
      console.error('SectionModel: Failed to search sections:', error);
      throw error;
    }
  }

  // ========================================
  // Bulk Operations
  // ========================================

  /**
   * Bulk create sections (used when loading from JSON)
   * @param {Array<Object>} sectionsData - Array of section data
   * @returns {Promise<Array>} Created sections
   */
  async bulkCreate(sectionsData) {
    try {
      const sections = [];
      
      for (const sectionData of sectionsData) {
        const section = await this.create(sectionData);
        sections.push(section);
      }
      
      console.log(`SectionModel: Bulk created ${sections.length} sections`);
      
      return sections;
    } catch (error) {
      console.error('SectionModel: Failed to bulk create sections:', error);
      throw error;
    }
  }

  /**
   * Sync sections from JSON definitions
   * @param {Array<Object>} sectionsData - Sections from JSON files
   * @returns {Promise<Object>} Sync result
   */
  async syncFromDefinitions(sectionsData) {
    try {
      const result = {
        created: 0,
        updated: 0,
        disabled: 0,
      };

      const existingSectionIds = new Set();

      for (const sectionData of sectionsData) {
        const existing = await this.findBySectionId(sectionData.section_id);
        
        if (existing) {
          // Update existing section
          await this.updateBySectionId(sectionData.section_id, {
            ...sectionData,
            enabled: 1, // Re-enable if was disabled
          });
          result.updated++;
          existingSectionIds.add(sectionData.section_id);
        } else {
          // Create new section
          await this.create(sectionData);
          result.created++;
          existingSectionIds.add(sectionData.section_id);
        }
      }

      // Disable sections not in definitions
      const allSections = await this.find();
      for (const section of allSections) {
        if (!existingSectionIds.has(section.section_id)) {
          await this.disable(section.section_id);
          result.disabled++;
        }
      }

      console.log(`SectionModel: Sync complete - Created: ${result.created}, Updated: ${result.updated}, Disabled: ${result.disabled}`);
      
      return result;
    } catch (error) {
      console.error('SectionModel: Failed to sync from definitions:', error);
      throw error;
    }
  }

  // ========================================
  // Private Helpers
  // ========================================

  /**
   * Parse section (convert JSON strings back to objects)
   * @private
   * @param {Object} section - Raw section from database
   * @returns {Object} Parsed section
   */
  _parseSection(section) {
    if (!section) return null;

    const parsed = { ...section };

    // Parse JSON fields
    if (parsed.permissions && typeof parsed.permissions === 'string') {
      try {
        parsed.permissions = JSON.parse(parsed.permissions);
      } catch (e) {
        parsed.permissions = [];
      }
    }

    if (parsed.metadata && typeof parsed.metadata === 'string') {
      try {
        parsed.metadata = JSON.parse(parsed.metadata);
      } catch (e) {
        parsed.metadata = {};
      }
    }

    return parsed;
  }

  // ========================================
  // Validation
  // ========================================

  /**
   * Validate section data
   * @param {Object} data - Section data to validate
   * @throws {Error} If validation fails
   */
  static validate(data) {
    if (!data.section_id) {
      throw new Error('section_id is required');
    }

    if (!data.name) {
      throw new Error('name is required');
    }

    if (!data.type) {
      throw new Error('type is required');
    }

    const validTypes = ['main', 'sub', 'action'];
    if (!validTypes.includes(data.type)) {
      throw new Error(`Invalid type: ${data.type}`);
    }

    if (data.type !== 'main' && !data.parent_id) {
      throw new Error('parent_id is required for sub and action sections');
    }
  }
}

module.exports = SectionModel;
