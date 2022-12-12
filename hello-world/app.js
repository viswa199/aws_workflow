const axios = require('axios')
require('dotenv').config()
// const url = 'http://checkip.amazonaws.com/';
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    const body = JSON.parse(event.body)

    const customer= body.customer;
    const {id,email,first_name,last_name,phone}=customer
    const customer_name=`${first_name} ${last_name}`

    const {line_items} = body 
    const {name} = line_items[0]
    try {
            //checking if the person is in the pipedrive, if not we will add the person in the pipedrive.
        const hasPerson = await getPerson(name)
        if(!hasPerson){
            const customer_params = {
                name:customer_name,
                email:email,
                phone:phone,
                owner_id:id
            }
            const ret=await axios.post('https://api.pipedrive.com/v1/persons?api_token=36e1a6266ddbc67f0f6e705ea5de3bb6b47b03d5',customer_params)
        }
     
            //checking, if the product is in the pipedrive, if not we will add product to pipedrive.
        const hasProduct = await getProduct(name)
        if(!hasProduct){
            const product_params ={
                name:name
            }
        const ret = await axios.post('https://api.pipedrive.com/v1/products?api_token=36e1a6266ddbc67f0f6e705ea5de3bb6b47b03d5',product_params)
       }
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'hello world',
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};

const getPerson = async(name)=>{
    const firstChar=name[0]
    var data=await axios.get(`https://api.pipedrive.com/v1/persons?first_char=${firstChar}&api_token=36e1a6266ddbc67f0f6e705ea5de3bb6b47b03d5`)
    data = data.data.data

    if(data==null){
        return false
    }

    for(let item of data){
        if(item.name==name){
            return true
        }
    }
    return false 
}

const getProduct = async(name)=>{
    const firstChar=name[0]
    var data = await axios.get(`https://api.pipedrive.com/v1/products?first_char=${firstChar}&api_token=36e1a6266ddbc67f0f6e705ea5de3bb6b47b03d5`)
    data = data.data.data;

    if(data==null){
        return false
    }
    
    for(let item of data){
        console.log(item.name)
        if(item.name==name){
            return true
        }
    }

    return false
}