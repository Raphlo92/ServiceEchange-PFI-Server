const NewsRepository = require('../models/newsRepository');

module.exports = 
class NewsController extends require('./Controller') {
    constructor(req, res, needAuthorization = false){
        super(req, res, needAuthorization /* needAuthorization */);
        this.newsRepository = new NewsRepository(req, this.getQueryStringParams());
    }
    error(params, message){
        params["error"] = message;
        this.response.JSON(params);
        return false;
    }
    queryStringParamsList(){
        let content = "<div style=font-family:arial>";
        content += "<h4>List of parameters in query strings:</h4>";
        content += "<h4>? sort=key <br> return all news sorted by key values (Id, Title, Desc, Image, UserId, UserName, UserAvatar)";
        content += "<h4>? sort=key,desc <br> return all news sorted by descending key values";        
        content += "<h4>? key=value <br> return the news with key value = value";
        content += "<h4>? key=value* <br> return the news with key value that start with value";
        content += "<h4>? key=*value* <br> return the news with key value that contains value";        
        content += "<h4>? key=*value <br> return the news with key value end with value";
        content += "</div>";
        return content;
    }
    queryStringHelp() {
        // expose all the possible query strings
        this.res.writeHead(200, {'content-type':'text/html'});
        this.res.end(this.queryStringParamsList());
    }
  
    head() {
        console.log("ETag: " + this.newsRepository.ETag);
        this.response.JSON(null, this.newsRepository.ETag);
    }

    // GET: api/news
    // GET: api/news?sort=key&key=value....
    // GET: api/news/{id}
    get(id){
        let params = this.getQueryStringParams();
        // if we have no parameter, expose the list of possible query strings
        if (this.params === null) { 
            if(!isNaN(id)) {
                this.response.JSON(this.newsRepository.get(id));
            }
            else  
                this.response.JSON( this.newsRepository.getAll(), 
                                    this.newsRepository.ETag);
        }
        else {
            if (Object.keys(params).length === 0) {
                this.queryStringHelp();
            } else {
                this.response.JSON(this.newsRepository.getAll(), this.newsRepository.ETag);
            }
        }
    }

    post(news){  
        if (this.requestActionAuthorized()) {
            let newNews = this.newsRepository.add(news);
            if (newNews)
                this.response.created(newNews);
            else
                this.response.unprocessable();
        } else 
            this.response.unAuthorized();
    }
    
    put(news){
        if (this.requestActionAuthorized()) {
            if (this.newsRepository.update(news))
                this.response.ok();
            else
                this.response.unprocessable();
        } else
            this.response.unAuthorized();
    }

    remove(id){
        if (this.requestActionAuthorized()) {
            if (this.newsRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        } else
            this.response.unAuthorized();
    }
}