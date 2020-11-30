<template>
	<div class="nav">
		<a-menu
			class="menu"
			mode="inline"
			style="height: 100%"
			v-model:openKeys="openKeys"
			v-model:selectedKeys="selectedKeys"
		>
			<div class="header">
				<div class="cover">
					<img :src="articleInfo.author.avatar" alt="" />
				</div>
				<div class="info">
					<div class="title">{{ articleInfo.title }}</div>
					<div class="author">{{ articleInfo.author.name }}</div>
					<div class="desc">{{ articleInfo.author.intro }}</div>
				</div>
			</div>
			<a-sub-menu v-for="item in navList" :key="item.id">
				<template #title>
					<span
						><span>{{ item.title }}</span></span
					>
				</template>
				<a-menu-item-group>
					<a-menu-item
						@click="changeArticle(citem.id)"
						:key="citem.id"
						v-for="citem in item.children"
						>{{ citem.title }}</a-menu-item
					>
				</a-menu-item-group>
			</a-sub-menu>
		</a-menu>
	</div>
</template>

<script lang="ts">
import { ref, Ref, reactive, toRefs, onMounted, defineComponent } from "vue";
import { AxiosResponse } from "axios";
import axios from "../utils/axios";

interface NavListInterface {
	title: string;
	children: Array<any>;
	id: string | number;
}

interface Author {
	name?: string;
	avatar?: string;
}

interface ArticleInfo {
	author: Author;
	title: string;
}

interface DataInterface {
	navList: Array<NavListInterface>;
	currentArticleDetail: object;
	openKeys: Array<string | number>;
	selectedKeys: Array<string | number>;
	articleInfo: ArticleInfo;
}

export default defineComponent({
	name: "Nav",
	setup(props, { emit }) {
		const data = reactive<DataInterface>({
			navList: [],
			currentArticleDetail: {},
			openKeys: [],
			selectedKeys: [],
			articleInfo: {
				author: {},
				title: "",
			},
		});

		onMounted(() => {
			getNavList();
			getArticleInfo();
		});

		function getArticleInfo() {
			axios.get("/article/info").then((res: any) => {
				data.articleInfo = res;
			});
		}

		function getNavList() {
			axios.get("/list/nav").then((res: any) => {
				data.navList = res;
				if (
					data.navList &&
					data.navList[0] &&
					data.navList[0].children &&
					data.navList[0].children[0]
				) {
					data.openKeys.push(data.navList[0].id);
					data.selectedKeys.push(data.navList[0].children[0].id);
					changeArticle(data.navList[0].children[0].id);
				}
			});
		}

		function changeArticle(id: string) {
			emit("navChange", id);
		}

		return {
			...toRefs(data),
			changeArticle,
		};
	},
});
</script>

<style lang="scss" scoped>
.nav {
	width: 320px;
	height: 100%;
	position: absolute;
	left: 0px;
	top: 0px;
	overflow: auto;
	&::-webkit-scrollbar {
		width: 7px;
		background-color: transparent;
	}
	/*定义滑块
 内阴影+圆角*/
	&::-webkit-scrollbar-thumb {
		border-radius: 10px;
		-webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
		background-color: #999;
	}
	.header {
		height: 110px;
		display: flex;
		justify-content: space-between;
		margin: 20px;
		overflow: hidden;
		.cover {
			width: 90px;
			height: 110px;
			border-radius: 5px;
			overflow: hidden;
			img {
				height: 100%;
				position: relative;
				left: 50%;
				top: 50%;
				transform: translate(-50%, -50%);
			}
		}
		.info {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			.title,
			.author,
			.desc {
				width: 178px;
				height: 20px;
        margin-left: 10px;
			}
			.title {
				font-size: 16px;
				line-height: 20px;
				color: #404040;
				font-weight: 600;
				-webkit-font-smoothing: antialiased;
			}
			.author {
				font-size: 14px;
				overflow: hidden;
				line-height: 20px;
				height: 20px;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
			.desc {
				font-size: 14px;
				line-height: 20px;
				width: 166px;
				display: -webkit-box;
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				overflow: hidden;
				height: 40px;
				text-overflow: ellipsis;
			}
		}
	}
}
</style>
