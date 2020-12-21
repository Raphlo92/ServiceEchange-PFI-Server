const Repository = require('./Repository');
const ImageFilesRepository = require('./imageFilesRepository.js');
const News = require('./news.js');
const utilities = require("../utilities");
module.exports = 
class NewsRepository extends Repository {
    constructor(req, params){
        super('News', true);
        this.users = new Repository('Users');
        this.req = req;
        this.params = params;
        this.setBindExtraDataMethod(this.bindUsernameAndImageURL);
    }
    bindUsernameAndImageURL(news){
        if (news) {
            let user = this.users.get(news.UserId);
            let username = "unknown";
            let userAvatarURL = "";
            if (user !== null) {
                username = user.Name;
                if (user.AvatarGUID != "")
                    userAvatarURL = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(user["AvatarGUID"]);
            } 
            let bindedNews = {...news};
            bindedNews["Username"] = username;
            bindedNews["UserAvatarURL"] = userAvatarURL;
            const datesOptions = { hour:'numeric', minute:'numeric', second:'numeric'};
            bindedNews["Date"] = new Date(news["Created"] * 1000).toLocaleDateString('fr-FR', datesOptions);

            if (news["GUID"] != ""){
                bindedNews["OriginalURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(news["GUID"]);
                bindedNews["ThumbnailURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getThumbnailFileURL(news["GUID"]);
            } else {
                bindedNews["OriginalURL"] = "";
                bindedNews["ThumbnailURL"] = "";
            }
            return bindedNews;
        }
        return null;
    }
    
    add(news) {
        news["Created"] = utilities.nowInSeconds();
        if (News.valid(news)) {
            news["GUID"] = ImageFilesRepository.storeImageData("", news["ImageData"]);
            delete news["ImageData"];
            return super.add(news);
        }
        return null;
    }
    update(news) {
        news["Created"] = utilities.nowInSeconds();
        if (News.valid(news)) {
            let foundNews = super.get(news.Id);
            if (foundNews != null) {
                news["GUID"] = ImageFilesRepository.storeImageData(news["GUID"], news["ImageData"]);
                delete news["ImageData"];
                return super.update(news);
            }
        }
        return false;
    }
    remove(id){
        let foundNews = super.get(id);
        if (foundNews) {
            ImageFilesRepository.removeImageFile(foundNews["GUID"]);
            return super.remove(id);
        }
        return false;
    }
}