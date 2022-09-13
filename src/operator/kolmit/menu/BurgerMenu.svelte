<script>
    import BurgerButton from './BurgerButton.svelte'
    import SideMenu from './SideMenu.svelte'
    export let open = false;
    export let duration = 0.4;
    export let width = '245px';
    export let padding = '20px';
    export let paddingTop = '50px';
    export let backgroundColor = 'rgb(255, 255, 255)';
    export let burgerColor = 'rgb(18.4, 18.4, 18.4)';
    export let menuColor = 'rgb(180, 180, 180)';
    let burgerProps = {
        duration: duration,
        burgerColor: burgerColor,
        menuColor: menuColor
    }
    let menuProps = {
        duration: duration,
        width: width,
        padding: padding,
        paddingTop: paddingTop,
        backgroundColor: backgroundColor,
        menuColor: menuColor
    }
</script>

<BurgerButton {...burgerProps} bind:open={open}/>

<SideMenu {...menuProps} bind:open={open}>
    <slot></slot>
</SideMenu>