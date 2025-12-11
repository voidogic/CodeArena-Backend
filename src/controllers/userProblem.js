const axios = require('axios')
const Problem = require("../models/problem");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const User = require('../models/user');
const Submission = require('../models/submission');
const SolutionVideo = require('../models/solutionVideo');

const createProblem = async (req, res) => {
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator } = req.body;
    try {
        for (const { language, completeCode } of referenceSolution) {


            const languageId = getLanguageById(language);
            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submissions);

            //submit ke baad token provide hoga fir judge0 bolega tum token leke jao future me anna leke wapas to  accepted kra du , abhi server busy hai thoda ...
            const resultToken = submitResult.map((value) => value.token)
            const testResult = await submitToken(resultToken);

            console.log(testResult);

            // console.log("hi"); 
            for (const test of testResult) {
                if (test.status_id != 3)
                    return res.status(400).send("Error Occured");
            }
        }

        //we can store it our db
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        })
        res.status(201).send("Problem Saved Successfull");
    } catch (error) {
        console.log("Errorrr:" + error);
        res.status(500).send("Internal Server Error");
    }
}

const updateProblem = async (req, res) => {
    const { id } = req.params;
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator } = req.body;

    try {

        if (!id) {
            return res.status(400).send("Invalid Id Field");
        }

        const DsaProblem = await Problem.findById(id);
        if (!DsaProblem) {
            return res.status(404).send("Id is not present in server");
        }

        for (const { language, completeCode } of referenceSolution) {


            const languageId = getLanguageById(language);
            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitResult = await submitBatch(submissions);

            const resultToken = submitResult.map((value) => value.token)
            const testResult = await submitToken(resultToken);

            for (const test of testResult) {
                if (test.status_id != 3)
                    return res.status(400).send("Error Occured");
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators0: true, new: true });
        res.status(200).send(newProblem);

    } catch (error) {
        res.status(404).send("Error: " + error);
    }
}

const deleteProblem = async (req, res) => {

    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).send("Id is Missing");
        }
        const deletedProblem = await Problem.findByIdAndDelete(id);

        if (!deletedProblem) {
            return res.status(404).send("Problem Is Missing");
        }
        res.status(200).send("Successfull Deleted");
    } catch (error) {
        return res.status(500).send("Error" + error);
    }



}


const getProblemById = async (req, res) => {

    const { id } = req.params;
    try {

        if (!id)
            return res.status(400).send("ID is Missing");

        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution ');
        // console.log(getProblem);
        // console.log(getProblem.secureUrl);

        // video ka jo bhi url wagera le aao

        if (!getProblem)
            return res.status(404).send("Problem is Missing");

        const videos = await SolutionVideo.findOne({ problemId: id });

        if (videos) {
            const responseData = {
                ...getProblem.toObject(),
                secureUrl: videos.secureUrl,
                thumbnailUrl: videos.thumbnailUrl,
                duration: videos.duration
            }   
            return res.status(200).send(responseData);
        }

        res.status(200).send(getProblem);

    }
    catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const getAllProblem = async (req, res) => {

    try {
        const getProblem = await Problem.find({}).select('_id title difficulty tags'); // we gives empty object uske base pe sara problem dedega
        if (getProblem.length == 0)
            return res.status(404).send("Problem Is Missing");
        res.status(200).send(getProblem);
    } catch (error) {
        res.status(500).send("Error: " + err);
    }
}

const solvedAllProblemByUser = async (req, res) => {

    try {
        const count = req.result.problemSolved.length;

        const userId = req.result._id;

        // ye kya krr rha hai ki isse user ka info to ayega hi sath me ,  ye jis problemSolved me ref diya gya tha vo bhi laa dega pura
        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags"
        });

        res.status(200).send(user.problemSolved);

    }
    catch (err) {
        res.status(500).send("Server Error");
    }
}


// const submittedProblem = async(req,res)=>{

//   try{

//     const userId = req.result._id;
//     const problemId = req.params.pid;

//    const ans = await Submission.find({userId,problemId});

//   if(ans.length==0)
//     res.status(200).send("No Submission is persent");

//   res.status(200).send(ans);

//   }
//   catch(err){
//      res.status(500).send("Internal Server Error");
//   }
// }


const submittedProblem = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.pid;

        const ans = await Submission.find({ userId, problemId });

        return res.status(200).json({
            success: true,
            data: ans || [], // ensure it's always an array
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};



module.exports = { createProblem, updateProblem, deleteProblem, getAllProblem, getProblemById, solvedAllProblemByUser, submittedProblem };
