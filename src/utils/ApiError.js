class ApiError extends Error {
    constructor(
        statuscode,
        message= "Somenthing went wrong",
        error = [],
        stack=""
    ){
        super(messege)
        this.statusCode = statusCode
        this.data =null
        this.message = message
        this.success = false;
        this.errors = errors 
        
        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.
                constructor)
        }
    }
}
export {ApiError}