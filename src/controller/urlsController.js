const shortid = require("shortid");
const validation = require("./../utility/validation");
const urlModel = require("./../models/urlModel");
const {
    SET_ASYNC,
    GET_ASYNC
} = require("../redis.config");

const create = async (req, res) => {
    try {
        const data = req.body;
        const sortUrlDomain = `${req.protocol}://${req.headers.host}`;

        if (validation.emptyObject(data))
            return res.status(400).send({
                status: false,
                message: "POST body must be required!",
            });

        let {
            longUrl
        } = data;

        if (validation.isEmpty(longUrl))
            return res.status(400).send({
                status: false,
                message: "longUrl must be required!",
            });

        if (validation.notURL(longUrl))
            return res.status(400).send({
                status: false,
                message: `'${longUrl}' is NOT a valid Url!`,
            });





        const getUrlFromCatch = await GET_ASYNC(longUrl);
        if (getUrlFromCatch) {
            //return data
            // console.log('get data from cache')
            const urlData = JSON.parse(getUrlFromCatch)
            return res.status(201).send({
                status: true,
                data: {
                    urlCode: urlData.urlCode,
                    longUrl: urlData.longUrl,
                    shortUrl: urlData.shortUrl
                },
            });
        }


        /*------ check if unique id already exist or NOT -------*/
        const isExistLongUrl = await urlModel
            .findOne({
                longUrl,
            })
            .select({
                _id: 0,
                __v: 0,
            });

        if (isExistLongUrl) {
            // console.log('get data DB and its already exist')
            await SET_ASYNC(`${longUrl}`, JSON.stringify(isExistLongUrl));
            return res.status(201).send({
                status: true,
                data: isExistLongUrl,
            });
        }

        /*------ generate short id -------*/
        const urlCode = shortid.generate().toLowerCase();

        const rawData = {
            urlCode,
            longUrl,
            shortUrl: `${sortUrlDomain}/${urlCode}`,
        };

        /*--------- save in db ----------*/
        await urlModel.create(rawData);
        // console.log('newly created data')
        await SET_ASYNC(`${longUrl}`, JSON.stringify(rawData)); //
        res.status(201).send({
            status: true,
            data: rawData,
        });
    } catch (e) {
        res.status(500).send({
            status: false,
            message: e.message,
        });
    }
};

const redirectUrl = async (req, res) => {
    try {
        const urlCode = req.params.urlCode;
        const getUrlFromCatch = await GET_ASYNC(urlCode);
        if (getUrlFromCatch) {
            // console.log("From Redis");
            return res.redirect(301, getUrlFromCatch)
        }

        const chkUrlCode = await urlModel.findOne({
            urlCode: urlCode,
        });

        if (!chkUrlCode)
            return res.status(404).send({
                status: false,
                message: "Url Not Found!",
            });

        // store as catch
        await SET_ASYNC(`${chkUrlCode.urlCode}`, chkUrlCode.longUrl);
        // console.log("From Mongo DB");
        return res.redirect(301, chkUrlCode.longUrl)

    } catch (err) {
        res.status(500).send({
            status: false,
            message: e.message,
        });
    }
};

module.exports = {
    create,
    redirectUrl,
};