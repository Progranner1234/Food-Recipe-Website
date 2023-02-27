const {Configuration , OpenAIApi } = require('openai')
console.log(process.env.OPENAI_API_KEY)

const configuration = new Configuration({
    organization:"org-9bdXtbo51KpQZo8tb2NnaQ99",
    apiKey:process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration);

const getRecipe = async(req , res)=> {
    try {
        const prompt = req.body.prompt
      const response = await openai.createCompletion({
        model:"text-davinci-003",
        prompt:`give me the ingridients of ${prompt} and how to make it step by step in details`,
        // prompt:"hello",
        temperature:0,
        max_tokens:3000,
        top_p:1,
        frequency_penalty:0.5,
        presence_penalty:0
      })

      res.status(200).send({
        bot:response.data.choices[0].text
      })
        
    } catch (err) {
        console.log(err)
        res.status(500).send(err.message)
    }
}

module.exports = {
    getRecipe,
}