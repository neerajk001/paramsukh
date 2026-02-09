import { Pdf } from '../../models/course.models.js';
import { Course } from '../../models/course.models.js';


export const addPdfToCourse = async(req ,res) =>{
    try{
        const {courseId}  = req.params;
        if(!courseId){
            return res.status(400).json({
                success: false,
                message:"course Id is required"
            });
        }
        const {title  ,description, pdfUrl ,thumbnailUrl ,order, isFree} = req.body;
        if(!title || !pdfUrl || !description || !thumbnailUrl ||   !order === undefined){
            return res.status(400).json({
                success: false,
                message:"title ,description ,pdfUrl ,thumbnailUrl and order are required"
            });
        }

        const course  =await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                success: false,
                message:"Course not found"
            })
        }
        course.pdfs.push({
            title,
            description,
            pdfUrl,
            thumbnailUrl,
            order,
            isFree: isFree || false
        })
        await course.save();
        return res.status(201).json({
            success: true,
            message:"Pdf added to course successfully",
            pdf: course.pdfs[course.pdfs.length - 1]
        });
    } catch (error) {
        console.error("❌ Error in adding pdf to course:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getCoursePdfs = async(req ,res) =>{
    try{
        const {courseId} =req.params;
        if(!courseId){
            return res.status(400).json({
                success: false,
                message:"course Id is required"
            })
        }
        const course  = await Course.findById(courseId).select('pdf');
        if(!course || !course.pdfs || course.pdfs.length === 0){
            return res.status(404).jsonn({
                success: false,
                message:"No pdfs found for this course"
            })
        }
        return re.status(200).json({
            success: true,
            message:"pdfs fetched successfully",
            pdfs: course.pdfs
        })
    }catch(error){
        console.error("❌ Error in fetching course pdfs:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const getPdfById = async(req , res) =>{
    try{
        const {courseId , pdfId} = req.params;
        if(!courseId || !pdfId){
            return res.status(400).json({
                success: false,
                message:"course Id and pdf Id are required"
            })
        }
        const course  = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                success: false,
                message:"Course not found"
            })
        }

        const pdf  = course.pdfs.id(pdfId);
        if(!pdf){
            return res.status(401).json({
                success:false,
                message:"pdf not found"
            })
        }
        return res.status(200).json({
            success: true,
            message:"pdf fetched successfully",
            pdf
        })
    }catch(error){
        console.error("❌ Error in fetching pdf by ID:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

export const updatePdf = async(req , res) =>{
    try{
        const {courseId , pdfId} = req.params;
        if(!courseId || !pdfId){
            return res.status(400).json({
                success: false,
                message:"course Id and pdf Id are required"
            })
        } 
        const updateData = req.body;
        if(!updateData || Object.keys(updateData).length === 0){
            return res.status(400).json({
                success: false,
                message:"Update data is required"
            })
        }
        
        const course  = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                success: false,
                message:"Course not found"
            })
        }

        const pdf  = course.pdfs.id(pdfId);
        if(!pdf){
            return res.status(404).json({
                success: false,
                message:"pdf not found"
            })
        }
        // update the pdf fields (only when provided)
        if(updateData.title !== undefined) pdf.title = updateData.title;
        if(updateData.description !== undefined) pdf.description = updateData.description;
        if(updateData.pdfUrl !== undefined) pdf.pdfUrl = updateData.pdfUrl;
        if(updateData.thumbnailUrl !== undefined) pdf.thumbnailUrl = updateData.thumbnailUrl;
        if(updateData.order !== undefined) pdf.order = updateData.order;
        if(updateData.isFree !== undefined) pdf.isFree = updateData.isFree;
        await course.save();
        return res.status(200).json({
            success: true,
            message:"pdf updated successfully",
            pdf
        })  
    }catch(error){
        console.error("❌ Error in updating pdf:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const deletePdf = async(req , res) =>{
    try{
        const {courseId , pdfId} = req.params;
        if(!courseId || pdfId){
            return re.status(400).json({
                success: false,
                message:"course Id and pdf Id are required"
            })
        }   
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({
                success: false,
                message:"Course not found"
            })
        }
        const pdf = course.pdfs.id(pdfId);
        if(!pdf){
            return res.status(404).json({
                success: false,
                message:"pdf not found"            
                           })
        }
        course.pdfs.pull(pdfId);
    }catch(error){
        console.error("❌ Error in deleting pdf:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}           