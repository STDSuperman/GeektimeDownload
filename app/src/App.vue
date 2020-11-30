<template>
	<div class="app-class">
		<Nav @navChange="navChange"></Nav>
		<ArticleContent :navId="navId"></ArticleContent>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import Nav from "./components/Nav.vue";
import ArticleContent from "./components/ArticleContent.vue";

export default defineComponent({
	name: "App",
	components: {
		Nav,
		ArticleContent,
	},
	setup() {
		const navId = ref<string>("");
		function navChange(id: string) {
			navId.value = id;
		}
		return {
			navChange,
			navId,
		};
	},
});
</script>

<style lang="scss">
.app-class{
	height: 100%;
}
</style>
