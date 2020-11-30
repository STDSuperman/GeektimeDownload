const axios = require('axios');
const { delay, writeData2File, readDataFromFile } = require('./utils')
const readline = require('readline');

let resultArticleDetail = [];
let currentArticleMap = {};

const headers = {
    Referer: 'https://time.geekbang.org/column/article/161575',
    'Host': 'time.geekbang.org',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
    Origin: 'https://time.geekbang.org',
    Cookie: 'gksskpitn=7e5f6896-eca4-4715-aa2d-7fb528807c4b; _ga=GA1.2.261647422.1606321397; _gid=GA1.2.74720159.1606321397; _gat=1; sajssdk_2015_cross_new_user=1; LF_ID=1606321397402-2930649-6036913; GCID=bddc9f2-784e4d6-f6b9d74-e8350e0; GRID=bddc9f2-784e4d6-f6b9d74-e8350e0; GCESS=BQoEAAAAAAsCBQACBP.Evl8MAQEDBP.Evl8EBAAvDQABCACeHQAAAAAACQEBCAEDBgTOMLRuBwShpUuABQQAAAAA; SERVERID=3431a294a18c59fc8f5805662e2bd51e|1606321408|1606321396; Hm_lvt_59c4ff31a9ee6263811b23eb921a5083=1606320580,1606321023,1606321272,1606321410; Hm_lpvt_59c4ff31a9ee6263811b23eb921a5083=1606321410; Hm_lvt_022f847c4e3acd44d4a2481d9187f1e6=1606320580,1606321023,1606321272,1606321410; Hm_lpvt_022f847c4e3acd44d4a2481d9187f1e6=1606321410; gk_process_ev={%22count%22:4%2C%22utime%22:1606321401027}; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%221940992%22%2C%22first_id%22%3A%2217600375dfb43c-0600505f141f65-930346c-3686400-17600375dfce3f%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E5%BC%95%E8%8D%90%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC%22%2C%22%24latest_referrer%22%3A%22https%3A%2F%2Faccount.infoq.cn%2F%22%2C%22%24latest_landing_page%22%3A%22https%3A%2F%2Ftime.geekbang.org%2Fcolumn%2Farticle%2F161575%22%7D%2C%22%24device_id%22%3A%2217600375dfb43c-0600505f141f65-930346c-3686400-17600375dfce3f%22%7D'
}

function readSyncByRl(tips) {
    tips = tips || '> ';

    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(tips, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

function getLocalArticleList() {
    const list = readDataFromFile('articleList.json');
    currentArticleMap = readDataFromFile('./articles/articleDetailMap.json');
    startDownArticleDetail(list);
}

function getNetworkArticleList() {
    return axios({
        url: 'https://time.geekbang.org/serv/v1/column/articles',
        headers,
        method: 'post',
        data: {
            chapter_ids: ["1031", "1032", "1037", "1097", "1202", "1239", "1246", "1271", "1289", "1356", "1367", "1446", "1480", "1061", "1517"],
            cid: 250,
            order: "earliest",
            prev: 0,
            sample: false,
            size: 100
        }
    }).then(async res => {
        writeData2File('./articles/articleList.json', res.data.data.list);
        currentArticleMap = readDataFromFile('./articles/articleDetailMap.json');
        startDownArticleDetail(res.data.data.list);
        console.log(res.data.data.page.count);
    })
}

async function getComments(info, score = 0) {
    return axios({
        url: 'https://time.geekbang.org/serv/v1/comments',
        method: 'post',
        data: {
            aid: info.id,
            prev: score
        },
        headers
    }).then(async res => {
        const { list, page } = res.data.data;
        console.log(page.more);
        return page.more ? list.concat(await getComments(info, list[list.length - 1].score)) : list
    });
}

async function startDownArticleDetail(data = []) {
    while(data.length) {
        const info = data.shift();
        try {
            if (!currentArticleMap[info.id]) {
                await saveArticleContent(info);
                await delay(2000);
            }
        } catch (err) {
            data.push(info);
            writeData2File('articleList.json', data);
            console.log('请更换cookie');
            break;
        }
    }
    writeData2File('articleDetail.json', resultArticleDetail);
    const fullArticleDetailList = readDataFromFile('./articles/articleDetailList.json').concat(resultArticleDetail);
    writeData2File('./articles/articleDetailList.json', fullArticleDetailList);
    formatArticleList2Map(fullArticleDetailList);
    const navList = await getNavList();
    const articleInfo = await getArticleInfo()
    mergeArticleData(articleInfo, fullArticleDetailList, navList);
}

function saveArticleContent(info) {
    return axios({
        url: 'https://time.geekbang.org/serv/v1/article',
        method: 'post',
        data: {
            id: info.id,
            include_neighbors: true,
            is_freelyread: true
        },
        headers
    }).then(async res => {
        const { data } = res.data;
        data.commentsList = await getComments(info);
        resultArticleDetail.push(data);
        return resultArticleDetail;
    });
}

function checkResultCorrectness() {
    const result = readDataFromFile('articleDetail.json');
    result.reduce((pre = 0, cur) => {
        let curNum = parseInt(cur.article_title.split('|')[0]) || 0;
        if ((curNum - pre) !== 1) {
            console.log(pre, curNum, cur.article_title);
            throw '数据不完整';
        }
        return curNum;
    }, -1);
}

async function getNavList() {
    return axios({
        url: 'https://time.geekbang.org/serv/v1/chapters',
        method: 'post',
        data: {
            cid: 250
        },
        headers
    }).then(async res => {
        let { data } = res.data;
        const articleDetails = readDataFromFile('./articles/articleDetailList.json');
        let navIdMap = {};
        data.forEach((item, index) => (navIdMap[item.id] = index))
        articleDetails.forEach(item => {
            const idx = navIdMap[item.chapter_id];
            !data[idx].children && (data[idx].children = []);
            data[idx].children.push({ id: item.id, title: item.article_title });
        })
        writeData2File('./articles/navList.json', data);
        return data;
    }).catch(err => {
        console.log(err);
        return [];
    });
}

function getArticleInfo() {
    return axios({
        url: 'https://time.geekbang.org/serv/v3/column/info',
        method: 'post',
        data: {
            product_id: 250
        },
        headers
    }).then(async res => {
        const { data } = res.data;
        writeData2File('./articles/articleInfo.json', data);
        return data;
    }).catch(err => {
        console.log(err);
        return {};
    });
}

async function formatArticleList2Map(articleList = []) {
    let articleId2Map = {};
    while(articleList.length) {
        let item = articleList.shift();
        item.noteList = await getNoteList(item);
        articleId2Map[item.id] = item;
        await delay(1000);
    }
    writeData2File('./articles/articleDetailMap.json', articleId2Map);
    return articleId2Map;
}

function mergeArticleData(info, articleDetailList, navList) {
    const articleMap = readDataFromFile('./articles/articleMap.json') || {};
    articleMap[info.extra && info.extra.cid] = {
        info,
        articleDetailList,
        navList
    }
    writeData2File('./articles/articleMap.json', articleMap);
}

function getNoteList(info) {
    return axios({
        method: 'post',
        url: 'https://time.geekbang.org/serv/v3/note/uline/list',
        headers,
        data: {
            aid: info.id
        }
    }).then(res => {
        return res.data.data.list || [];
    })
}

// getNavList();
// getNetworkArticleList();
// getLocalArticleList();
// checkResultCorrectness()
// getArticleInfo()
// mergeArticleData();
// formatArticleList2Map();