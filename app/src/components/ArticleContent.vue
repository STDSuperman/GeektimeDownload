<template>
	<div class="article-detial" v-highlight>
        <div class="center-body">
            <div class="header">
                <img :src="articleCover" alt="" srcset="" class="top-img">
                <audio :src="articleDetail.audio_download_url"></audio>
            </div>
            <div class="content"  v-html="articleDetail.article_content"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, watch, ref, onMounted, computed, Ref } from "vue";
import axios from "../utils/axios";

interface Props {
	navId: string;
}

interface ArticleDetail {
    article_cover: string
    value: any
}

declare global {
    interface Window {
        hljs: any;
    }
}

export default defineComponent({
	name: "ArticleContent",
	props: {
		navId: {
			type: [String,Number],
		},
	},
	setup(props: Props) {

        let articleDetail = ref<ArticleDetail>({
            value: {},
            article_cover: ''
        });

        const articleCover = computed(() => articleDetail.value.article_cover);

        // onMounted(() => {
        //     axios.get('/article/info').then((res: any) => {
        //         articleInfo.value = res;
        //     })
        // });

		function getArticleDetail(id: string): any {
			return axios.get("/article/detail", { params: { id } });
		}

		watch(
			() => props.navId,
			async (val) => {
				articleDetail.value = await getArticleDetail(val);
			}
		);

        return { articleDetail, articleCover };
	},
    directives: {
        highlight: {
            mounted(el) {
                let blocks = el.querySelectorAll('pre code');
                for (let i = 0; i < blocks.length; i++) {
                    window.hljs.highlightBlock(blocks[i]);
                }
            },
            updated(el) {
                let blocks = el.querySelectorAll('pre code');
                for (let i = 0; i < blocks.length; i++) {
                    window.hljs.highlightBlock(blocks[i]);
                }
            },
        }
    }
});
</script>

<style lang="scss">
.article-detial{
    height: 100%;
    margin-left: 320px;
    padding: 20px;
    overflow: auto;
    .center-body{
        margin: 20px auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 780px;
        .top-img{
            border-radius: 10px;
            margin-bottom: 20px;
            width: 100%;
        }
        .content{
            font-size: 17px;
            width: 100%;
            h2{
                font-weight: bold;
                margin-top: 0px;
                margin-bottom: 20px;
                font-size: 20px;
            }
            h3 {
                font-weight: bold;
                margin-top: 0px;
                margin-bottom: 20px;
                font-size: 19px;
            }
            img{
                width: 100%;
            }
        }
    }
}
</style>
