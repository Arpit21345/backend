import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      return cb(null, "public/temp");
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
     return cb(null, file.originalname)
    }
  })
  
  export const upload = multer({
     storage:storage
    });



//   cb(null, file.fieldname + '-' + uniqueSuffix)
// this is imp but  for big projects