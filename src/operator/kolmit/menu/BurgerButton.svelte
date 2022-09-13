<script>
  export let open;

  export let duration;
  export let burgerColor;
  export let menuColor;
</script>

<button
  class:open
  on:click={() => (open = !open)}
  style="transition: color {duration}s ease-in-out; color: {open
    ? menuColor
    : burgerColor};"
>
<svg width=26 height=26>
    <line id="top" x1=0 y1=8  x2=26 y2=8    style="transition: transform {duration}s ease-in-out, opacity {duration}s ease-in-out;"/>
    <line id="mid" x1=0 y1=16 x2=26 y2=16 style="transition: transform {duration}s ease-in-out, opacity {duration}s ease-in-out;"/>
    <line id="bot" x1=0 y1=24 x2=26 y2=24  style="transition: transform {duration}s ease-in-out, opacity {duration}s ease-in-out;"/>
</svg>
</button>




<style>
  button {
    position: absolute;
    right: 20px;
    top: 0px;

    margin: 5px;

    z-index: 100;

    background-color: Transparent;
    background-repeat: no-repeat;
    border: none;
    cursor: pointer;
    overflow: hidden;
    outline: none;
  }

  svg line {
    stroke: currentColor;
    stroke-width: 3;
  }

  /* rotate the top line */
  .open #top {
    transform: translate(10px, 0px) rotate(45deg);
  }

  /* hide the middle */
  .open #mid {
    opacity: 0;
  }

  /* rotate the bottom line */
  .open #bot {
    transform: translate(-15px, 8px) rotate(-45deg);
  }
</style>
