import mongoose from "mongoose";

class ApiFeaturs {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr

    }

    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: "i",
            },
        } : {};
 
        // console.log("keyword", keyword)
        this.query = this.query.find({ ...keyword })
        // console.log(this)
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr }
        // console.log("queryCopy",queryCopy)

        // Removing some  fields for category 
        const removeFields = ["keyword", "page", "limit"];

        removeFields.forEach(key => delete queryCopy[key])
        // console.log("queryCopy",queryCopy)

        let queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,key=>`$${key}`  );


        this.query = this.query.find(JSON.parse(queryStr));
        // console.log("queryStr",queryStr)
        return this
     
    }

    pagination(resultPerpage){
        const currentPage = Number(this.queryStr.page) || 1 ;    
        const skip =  resultPerpage * (currentPage - 1) ;
        this.query = this.query.limit(resultPerpage).skip(skip)
        return this
    }
}

export default ApiFeaturs;