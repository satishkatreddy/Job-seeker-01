const asyncHandler = require('../utils/asyncHandler');
const jobModel = require('../Models/jobModel');
const appError = require('../utils/appError');
const companyModel = require('../Models/companyModel');
const { default: mongoose } = require('mongoose');

//job posted
const postedJob = asyncHandler(async (req, res) => {

    const postedDetails = {
        jobType, jobLocation, salary, vacancies, jobTitle, details
    } = req.body;

    if (!postedDetails || !postedDetails.length === 0) {
        throw new appError('provide valid Input', 400)
    }

    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new appError('provide valid Id', 400)
    }
    const companyAdmin = await companyModel.findById({ _id: id, active: true })
    if (!companyAdmin) {
        throw new appError('company is not found!!', 404)
    }

    const saveJobDetails = await jobModel.create({

        jobTitle: postedDetails.jobTitle,
        jobType: postedDetails.jobType,
        salary: postedDetails.salary,
        vacancies: postedDetails.vacancies,
        details: { desc, requirements },
        jobLocation: postedDetails.jobLocation,
        company: id
    })
    return res.status(201).json({ message: 'job posted successfully', data: saveJobDetails });
})

//job post updated 
const jobPostUpdated = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new appError('provide valid Id', 400)
    }
    const Jobs = await jobModel.findById({ _id: id, active: true })
    if (!Jobs) {
        throw new appError('Job deatils not found!', 404)
    }
    const userId = req.user.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new appError('provide valid in company Id', 400)
    }
    const JobUpdateDetails = await jobModel.findByIdAndUpdate(id, {
        $set: {
            jobTitle: Jobs.jobTitle,
            jobType: Jobs.jobType,
            salary: Jobs.salary,
            vacancies: Jobs.vacancies,
            details: { desc, requirements },
            jobLocation: Jobs.jobLocation,
        }

    }, { new: true })
    return res.status(200).json({ message: 'Jobs post updated successfully', data: JobUpdateDetails })
})


//get Job details in the Job Id
const getJobById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const job = await jobModel.findById({ _id: id }).populate({
        path: "company",
        select: "-password",
    });

    if (!job) {
        return res.status(200).send({
            message: "Job Post Not Found",
            success: false,
        });
    }

    //GET SIMILAR JOB POST
    const searchQuery = {
        $or: [
            { jobTitle: { $regex: job?.jobTitle, $options: "i" } },
            { jobType: { $regex: job?.jobType, $options: "i" } },
        ],
    };

    let queryResult = await jobModel.find(searchQuery)
        .populate({
            path: "company",
            select: "-password",
        })
        .sort({ _id: -1 });

    queryResult = queryResult.limit(6);
    const similarJobs = await queryResult;

    res.status(200).json({
        success: true,
        data: job,
        similarJobs,
    });
});

 const getJobPosts = asyncHandler(async (req, res) => {
    
      const { search, sort, location, jtype, exp } = req.query;
      const types = jtype?.split(","); //full-time,part-time
      const experience = exp?.split("-"); //2-6
  
      let queryObject = {};
  
      if (location) {
        queryObject.location = { $regex: location, $options: "i" };
      }
  
      if (jtype) {
        queryObject.jobType = { $in: types };
      }
  
      //    [2. 6]
  
      if (exp) {
        queryObject.experience = {
          $gte: Number(experience[0]) - 1,
          $lte: Number(experience[1]) + 1,
        };
      }
  
      if (search) {
        const searchQuery = {
          $or: [
            { jobTitle: { $regex: search, $options: "i" } },
            { jobType: { $regex: search, $options: "i" } },
          ],
        };
        queryObject = { ...queryObject, ...searchQuery };
      }
  
      let queryResult = await jobModel.find(queryObject).populate({
        path: "company",
        select: "-password",
      });
  
      // SORTING
      if (sort === "Newest") {
        queryResult = queryResult.sort("-createdAt");
      }
      if (sort === "Oldest") {
        queryResult = queryResult.sort("createdAt");
      }
      if (sort === "A-Z") {
        queryResult = queryResult.sort("jobTitle");
      }
      if (sort === "Z-A") {
        queryResult = queryResult.sort("-jobTitle");
      }
  
      // pagination
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;
  
      //records count
      const totalJobs = await jobModel.countDocuments(queryResult);
      const numOfPage = Math.ceil(totalJobs / limit);
  
      queryResult = queryResult.limit(limit * page);
  
      const jobs = await queryResult;
  
      res.status(200).json({
        success: true,
        totalJobs,
        data: jobs,
        page,
        numOfPage,
      });
  });

//delete Job post
const deleteJobPost = asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new appError('provide valid Id', 400)
    }
    const jobPostDelete = await jobModel.findByIdAndDelete({ _id: id, active: true });
    if (!jobPostDelete) {
        throw new appError('Job is not found!', 404)
    }
    return res.status(200).json({ message: 'job post deleted successfully', data: jobPostDelete });
}) 

module.exports = {
    postedJob,
    jobPostUpdated,
    getJobById,
    deleteJobPost,
    getJobPosts

}