class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findOne(query) {
    return this.model.findOne(query);
  }

  async find(query, options = {}) {
    const { sort = {}, skip = 0, limit = 0, select } = options;
    let queryBuilder = this.model.find(query);

    if (Object.keys(sort).length) queryBuilder = queryBuilder.sort(sort);
    if (skip) queryBuilder = queryBuilder.skip(skip);
    if (limit) queryBuilder = queryBuilder.limit(limit);
    if (select) queryBuilder = queryBuilder.select(select);

    return queryBuilder;
  }

  async create(data) {
    return this.model.create(data);
  }

  async updateById(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }

  async count(query) {
    return this.model.countDocuments(query);
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }

  async distinct(field, query) {
    return this.model.distinct(field, query);
  }
}

module.exports = BaseRepository;
