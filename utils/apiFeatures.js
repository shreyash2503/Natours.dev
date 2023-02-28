class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    console.log("I was called");
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    // 2) Advanced filtering
    console.log(queryObj);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));
    //let query = Tour.find(JSON.parse(queryStr)); // ! find method returns a query
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sorted() {
    //console.log("I was called");
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-__v");
    }
    return this;
  }
  fieldLimiting() {
    //console.log("I was called");
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      console.log(fields);
      this.query = this.query.select(fields);
    }
    return this;
  }
  pagination() {
    //console.log("I was called");
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // page=2&limit=10, 1-10 page1, 11-20 page2, 21-30 page3
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
export default APIFeatures;
