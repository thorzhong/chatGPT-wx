'use strict';

const { time } = require("console");

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log("event:",event)
	// https://replicate.com/stability-ai/stable-diffusion/api#run
	// API 需要先获取计算的ID，然后通过ID获取计算的结果
	const calculate_id_res = await uniCloud.httpclient.request(event.url,{
		method:'POST',
		headers:{
			'Authorization': event.token, // 'Token' +
			'Content-Type': event.contentType
		},
		data: event.content,
		dataType: 'json' 
	})
	
	console.log('cloud calculate_id: ', calculate_id_res.data.id)
	
	// 然后根据calculate_id获取prediction结果
	// 这里需要把calculate_id_res写到这个await的函数里面，否则会出错，因为代码是异步执行的
	var retry_count = 0
	var status = "waiting"
	var max_try = 50
	var prediction_res = "default"
	
	while (status != "succeeded" && retry_count < max_try) {
		console.log("status:",status)
		await sleep(2000);
		prediction_res = await uniCloud.httpclient.request(event.url + "/" + calculate_id_res.data.id,{
			headers:{
				'Authorization': event.token, 
				'Content-Type': event.contentType
			},
			dataType: 'json'
		})
		status = prediction_res.data.status
		retry_count = retry_count + 1
	}
	
	console.log('cloud prediction output: ', prediction_res.data.output)
	
	//返回数据给客户端
	return prediction_res.data.output;
}; 

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}