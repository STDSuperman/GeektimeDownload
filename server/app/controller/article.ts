import { Controller } from 'egg';
const { readDataFromFile } = require('../utils');
const { resolve } = require('path');

interface ArticleMap {
    [key: string]: object;
}

export default class Article extends Controller {
    articleMap: ArticleMap;
    navList: Array<object>;
    articleInfo: object;
    constructor(props) {
        super(props);
        this.articleMap = readDataFromFile(resolve(__dirname, '../model/articleDetailMap.json')) || [];
        this.navList = readDataFromFile(resolve(__dirname, '../model/navList.json')) || [];
        this.articleInfo = readDataFromFile(resolve(__dirname, '../model/articleInfo.json')) || {};
    }
    getArticleDetail() {
        const { ctx } = this;
        const article = this.articleMap[ctx.query.id];
        ctx.body = article;
    }
    getNavList() {
        const { ctx } = this;
        ctx.body = this.navList;
    }
    getArticleInfo() {
        const { ctx } = this;
        ctx.body = this.articleInfo;
    }
}