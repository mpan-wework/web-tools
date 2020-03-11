const App = {
  name: 'App',
  template: `<div class="App" data-v-12345678 >
  <canvas
    ref="canvas"
    class="canvas"
    :width="canvas.w"
    :height="canvas.h"
  ></canvas>
  <div class="controls">
    <div>Canvas of width and height splitted into rows and columns</div>
    <div class="shape">
      <input
        v-for="k of canvasKeys"
        type="number"
        :placeholder="k"
        :title="k"
        min="0"
        :value="canvas[k]"
        @change="canvasChange($event, k)"
      />
    </div>
    <button @click="canvasDraw">Draw</button>
    <div v-for="(imageParam, i) of imageParams" class="control">
      <div>Index: {{ i }}</div>
      <div v-if="fileEnabled">
        <input type="file" accept="image/*" @change="loadImage($event, i)" />
      </div>
      <div>Crop Source with position and size</div>
      <div class="src">
        <input v-for="sk of srcKeys" type="number" :placeholder="sk" :title="sk" v-model="imageParam[sk]" min="0" />
      </div>
      <div class="src">
        <input
          v-for="sk of srcKeys"
          type="range"
          :placeholder="sk"
          :title="sk"
          v-model="imageParam[sk]"
          min="0"
          :max="(sk === 'sx' || sk === 'sw') ? imageParam.nw : imageParam.nh"
        />
      </div>
      <div>Paste to Destination with position and size</div>
      <div class="dest">
        <input v-for="dk of destKeys" type="number" :placeholder="dk" :title="dk" v-model="imageParam[dk]" min="0" />
      </div>
      <div class="dest">
        <input v-for="dk of destKeys" type="range" :placeholder="dk" :title="dk" v-model="imageParam[dk]" min="0" :max="500" />
      </div>
    </div>
  </div>
</div>`,
  data() {
    return {
      imageParams: [],
      canvas: {
        w: 600,
        h: 600,
        r: 1,
        c: 0,
      },
    };
  },
  computed: {
    fileEnabled() {
      return typeof window.FileReader === 'function';
    },
    canvasKeys() {
      return ['w', 'h', 'r', 'c'];
    },
    srcKeys() {
      return ['sx', 'sy', 'sw', 'sh'];
    },
    destKeys() {
      return ['dx', 'dy', 'dw', 'dh'];
    },
    rowCount() {
      return this.canvas.r;
    },
    colCount() {
      return this.canvas.c;
    },
  },
  methods: {
    canvasChange(e, k) {
      this.canvas[k] = e.target.value;
      if (k === 'w' || k === 'h') {
        for (let i = 0, r = this.rowCount; i < r; i += 1) {
          for (let j = 0, c = this.colCount; j < c; j += 1) {
            const index = i * this.colCount + j;
            const rowUnit = this.canvas.h / this.rowCount;
            const colUnit = this.canvas.w / this.colCount;
            this.imageParams[index] = {
              ...this.imageParams[index],
              dx: j * colUnit,
              dy: i * rowUnit,
              dw: colUnit,
              dh: rowUnit,
            };
          }
        }
      } else if (k === 'r' || k === 'c') {
        for (let i = 0, l = this.imageParams.length; i < l; i += 1) {
          const img = this.imageParams[i].image;
          img && img.remove();
          this.imageParams[i].image = null;
        }
        this.imageParams = [];
        this.$nextTick(() => {
          for (let i = 0, r = this.rowCount; i < r; i += 1) {
            for (let j = 0, c = this.colCount; j < c; j += 1) {
              const rowUnit = this.canvas.h / this.rowCount;
              const colUnit = this.canvas.w / this.colCount;
              this.imageParams.push({
                file: null, image: null,
                nw: 0, nh: 0, sx: 0, sy: 0, sw: 0, sh: 0,
                dx: j * colUnit,
                dy: i * rowUnit,
                dw: colUnit,
                dh: rowUnit,
              });
            }
          }
        });
      }
    },
    loadImage(e, i) {
      console.debug(`loading image${i}`);
      try {
        this.imageParams[i].file = e.target.files[0];
        const fr = new FileReader();
        fr.onload = () => {
          const img = new Image();
          img.onload = () => {
            this.imageParams[i].nw = img.naturalWidth;
            this.imageParams[i].nh = img.naturalHeight;
            this.imageParams[i].sw = img.naturalWidth;
            this.imageParams[i].sh = img.naturalHeight;
          };
          img.src = fr.result;
          this.imageParams[i].image = img;
        };
        fr.readAsDataURL(this.imageParams[i].file);
      } catch (error) {
        console.error(error);
      }
    },
    canvasDraw() {
      console.debug(`canvasDraw`);
      const context = this.$refs.canvas.getContext('2d');
      context.clearRect(0, 0, this.canvas.w, this.canvas.h);
      for (let i = 0, l = this.rowCount * this.colCount; i < l; i += 1) {
        if (this.imageParams[i].image) {
          const { sx, sy, sw, sh, dx, dy, dw, dh } = this.imageParams[i];
          context.drawImage(
            this.imageParams[i].image,
            sx, sy, sw, sh, dx, dy, dw, dh,
          );
        }
      }
    },
  },
};

const $vm = new Vue({
  render: (h) => h(App),
});
$vm.$mount('#vue');
window.$vm = $vm;
