const deleteProduct = (btn) => {
    const productId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productCart = btn.closest("article");
    
    fetch("/admin/products/" + productId,{
        method: "DELETE",
        headers:{
            "csrf-token": csrf
        }
    }).then(result => {
        return result.json();
    }).then(data => {
        productCart.parentNode.removeChild(productCart);
        console.log(data)
    })
    .catch(err => {
        console.log(err);
    })
}