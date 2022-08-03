function getXmlHttp(){
	try{
		return new ActiveXObject('Msxml2.XMLHTTP')
	}
	catch(e){
		try{
			return new ActiveXObject('Microsoft.XMLHTTP')
		}
		catch(ee){
		}
	}
	if(typeof XMLHttpRequest != 'undefined'){
		return new XMLHttpRequest()
	}
}
function isJSON(jsonString){
    try{
        let o = JSON.parse(jsonString)
        if(o && typeof o === 'object'){
            return o
        }
    }
    catch(e){}
    return false
}

document.addEventListener('DOMContentLoaded', (e) => {
	// sortBy images in gallery
	const sortByElem = document.querySelector('#sortBy')
	if(sortByElem){
		sortByElem.addEventListener('change', (ee) => {
			window.location.href = window.location.pathname + '?sortBy=' + sortByElem.value
		})
	}
	// add or remove like
	let userId = document.querySelector('#userid')
	if(!userId){
		return
	}
	let userId = userId.value.trim()
	if(!userId){
		return
	}
	document.querySelectorAll('.imagesList').forEach((imagesListElem) => {
		const authorId = imagesListElem.dataset['authorid'].trim()
		if(authorId && userId == authorId){
			return
		}
		imagesListElem.querySelectorAll('.likeInfo').forEach((likeInfoElem) => {
			likeInfoElem.classList.add('cursor_pointer')
			likeInfoElem.addEventListener('click', (ee) => {
				let elem = ee.target || ee.src
				if(!elem.dataset['filename']){
					elem = elem.parentNode
				}
				const author_id = authorId ? authorId : elem.dataset['authorid'].trim()
				if(author_id == userId){
					return
				}
				if(elem.classList.contains('processing')){
					return
				}
				elem.classList.add('processing')
				const filename = elem.dataset['filename'].trim()
				const xmlhttp = getXmlHttp()
				xmlhttp.open('POST', '/ajax', true)
				xmlhttp.setRequestHeader('X-REQUESTED-WITH', 'XMLHttpRequest')
				//xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
				//xmlhttp.send('authorid=' + author_id + '&filename=' + filename)
				xmlhttp.setRequestHeader('Content-Type', 'application/json')
				xmlhttp.send(JSON.stringify({authorid: author_id, filename}))
				xmlhttp.onreadystatechange = () => {
					if(xmlhttp.readyState == 4){
						if(xmlhttp.status == 200){
							const res = isJSON(xmlhttp.responseText)
							if(res && res.status){
								if((res.status == 'added' || res.status == 'removed')){
									if(res.status == 'added'){
										elem.querySelector('.likeIcon').classList.add('added')
									}
									else{
										elem.querySelector('.likeIcon').classList.remove('added')
									}
									if('likesCount' in res){
										elem.querySelector('.likesCount').innerHTML = res.likesCount
									}
								}
								else if(res.message){
									alert(res.message)
								}
								else{
									console.log(xmlhttp)
									alert(xmlhttp.responseText)
								}
							}
							else{
								console.log(xmlhttp)
								alert(xmlhttp.responseText)
							}
						}
						else{
							console.log(xmlhttp)
							let res = 'Ajax-error. Code: ' + xmlhttp.status
							if(xmlhttp.responseText){
								res += '. Response: ' + xmlhttp.responseText
							}
							alert(res)
						}
						elem.classList.remove('processing')
					}
				}
			})
		})
	})
})
