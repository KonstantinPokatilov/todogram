'use strict'; console.log('content script - load')

document.addEventListener('keyup', event => {
    if (event.key == 'Escape' && cookie.get('auth')) { cookie.set('deleteCookieAuth') } 
})

function butUserExit() {
    fetch('/api/user.php?direction=exit')
        .then(res => res.text())
        .then(text => {
            if (text) {
                location.reload()
            }
        })
}

const user = {
    
    users: {},
    role: '',
    email: '',
    name: '',
    id: 0,

    getAllUsers: function() {
        fetch('/api/user.php?direction=getAllUsers')
            .then(res => res.json())
            .then(json => {
                for (const userId in json) { 
                    user.users[userId] = json[userId]; 
                } 
                if (user.role == 'admin') {
                    items.showSelectedUser()
                }
            })
    },

    butShowAllUsers: function() {
        let users = ''
        const allUsers = document.querySelector('.all-users')
        if (allUsers) { 
            allUsers.remove() 
            return
        }
        else {
            if (user.users) {
                for (const userId in user.users) {
                    users += `<div class="email-user" userId="${userId}" but="user-changeUser">${user.users[userId].email}</div>`
                }

                const usersBlock = document.createElement('div')
                usersBlock.innerHTML = users
                usersBlock.classList.add('all-users')
    
                this.insertAdjacentElement('beforeend', usersBlock)
                document.addEventListener('click', event => {
                
                    if (!event.target.closest('.admin-changes') ) {
                        const allUsersSmall = document.querySelector('.all-users')
                        if (allUsersSmall) {
                            allUsersSmall.remove()
                        } 
                    }
                })
                butListener()
            }    
        }
    },

    butChangeUser: function() {
        const userId = this.getAttribute('userid')
        
        const parentItem = this.closest('div[item-id]')
        const email = this.textContent
        const itemId = parentItem.getAttribute('item-id')
        const taskValue = parentItem.querySelector('.item-input').value
        const taskId = document.querySelector('div[select]').getAttribute('projectid')
        const dataJson = {
            userId: userId,
            userIdFrom: task.allTasks.id,
            itemId: itemId, 
            emailFrom: task.allTasks.email, 
            emailTo: email,
            userName: task.allTasks.fullName,
            task:taskValue
        }
      
        if (!parentItem.classList.contains('task-done-item')) {
            task.counter('toggle', 'given')  
            
            fetch('/api/user.php?direction=changeUser&data=' + JSON.stringify(dataJson))
            document.querySelector('.all-users').remove()
    
            const selectedUser = parentItem.querySelector('.selected-user')
            selectedUser.classList.remove('invisible')
            selectedUser.innerText = this.textContent
            parentItem.remove()
    
            const item = task.allTasks.projects[taskId].items[itemId]
            
            task.allTasks.projects.given.items[itemId] = {name: item.name, description: item.description, date: item.date, state: item.state, id: userId}
            delete delete task.allTasks.projects[taskId].items[itemId]
        } 
    },
}

const task = {

    counter: {},
    projects: {},
    allTasks: {},

    firstFetch: function() {
        fetch('/api/task.php?direction=getTasks')
            .then(res => res.json())
            .then(json => {
                // console.log(json)
                user.role = json.user
                task.allTasks = json
                user.email = json.email
                user.name = json.fullName
                user.id = json.id

                user.getAllUsers()
                items.sortItems()

                let id = 0
                const storageProjectId = sessionStorage.getItem('projectId')
                if (storageProjectId) { id = storageProjectId }
                
                if (json) { task.parsingTasks(json, id) }
                for (const taskId in json.projects) { task.projects[taskId] = json.projects[taskId].name; } 
            })
    },

    butRender: function(id = 0) {
        if (this.hasAttribute('select')) { return }
        let projectId = id
        
        if (!id) { projectId = this.getAttribute('projectId') }
        if (this.hasAttribute('given')) { projectId = 'given' }
        
        if (task.allTasks) { task.parsingTasks(task.allTasks, projectId) }
        else { validError(text) }

        sessionStorage.setItem('projectId', projectId) 
        if (user.role == 'admin') {
            items.showSelectedUser()
        }
    },

    parsingTasks: function(tasksJson, projectId) {
        let myItems = ''
        let taskName = ''
        let doneItems = ''
        let taskColor = ''
        let projects = ''
        let constDef = 0
        let givenCount = ''
        let isCircle = false

        for (const taskId in tasksJson.projects) {
            const task = tasksJson.projects[taskId]
            let count = 0
            
            if (projectId) { 
                constDef = projectId 
            } 
            else if (!projectId) {    
                constDef = taskId
            }
            if (taskId == constDef) {
                if ('items' in task) {
                    for (const itemId in task.items) {
                        const item = task.items[itemId]
                        let itemName = ''
                        let itemState = ''
                        let itemDescription = ''
                        let itemDate = ''        
                        if ('description' in item && item.description) { itemDescription = item.description }
                        if ('name' in item && item.name) { itemName = item.name }
                        
                        if ('state' in item && item.state) { itemState = item.state }
                        if ('date' in item && item.date) { itemDate = item.date }

                        let splitDate = calendar.splitDate(itemDate)
                        if (!splitDate) { splitDate = '' }

                        if (itemId != "") {
                            if (itemState == 0) {
                                myItems += `<div class="task-item" item-id="${itemId}">
                                <div class="item-flex">
                                    <div class="item-text" ischeck="">
                                        <div class="inputs-flex">
                                            <div class="checkbox-block">
                                                <input type="checkbox" class="task-checkbox" id="check${itemId}">
                                                <label for="check${itemId}" class="label-check"></label>
                                            </div>
                                            <input type="text" value="${itemName}" class="item-input" placeholder="Введите заголовок задачи">
                                        </div>
                                        <div class="flex-svg-date">
                                            <div class="svg-down" but="task-switch">
                                                <img src="css/img/project-down.svg" class="done-description-svg done-description-item" alt="">
                                            </div>
                                            <div class="day-month-item" but="calendar-render">${splitDate}</div>
                                            <div class="datetime-block" but="calendar-render"></div> 
                                        </div> 
                                    </div>
                                    <div class="buttons-flex">
                                        <div class="move-in-project" but="items-itemMove"></div>
                                            <div class="delete-point" but="items-removeItem">
                                                <img src="css/img/delete.svg" alt="">
                                            </div>
                                    </div>
                                </div>
                                <textarea type="textarea" class="textarea-task invisible" placeholder="Введите краткое описание задачи">${itemDescription}</textarea>
                            </div>`
                            } else {
                                doneItems += `<div class="task-item task-done-item" item-id="${itemId}">
                                <div class="item-flex">
                                    <div class="item-text" ischeck="">
                                        <div class="inputs-flex">
                                            <div class="checkbox-block">
                                                <input type="checkbox" class="task-checkbox" id="check${itemId}" checked>
                                                <label for="check${itemId}" class="label-check"></label>
                                            </div>
                                            <input type="text" value="${itemName}" class="item-input item-done-text" placeholder="Введите заголовок задачи">
                                        </div>
                                        <div class="flex-svg-date">
                                        <div class="svg-down" but="task-switch">
                                            <img src="css/img/project-down.svg" class="done-description-svg done-description-item" alt="">
                                        </div>
                                        <div class="day-month-item" but="calendar-render">${splitDate}</div>
                                        <div class="datetime-block" but="calendar-render">
                                        </div> 
                                    </div>    
                                </div>
                                    <div class="move-in-project" but="items-itemMove"></div>
                                    <div class="delete-point" but="items-removeItem">
                                        <img src="css/img/delete.svg" alt="">
                                    </div>
                                    </div> 
                                    <textarea type="textarea" class="textarea-task invisible" placeholder="Введите краткое описание задачи">${itemDescription}</textarea>   
                                </div>`
                            }

                            items.descriptions[itemId] = itemDescription
                            items.itemValue[itemId] = itemName
                            items.itemDate[itemId] = itemDate
                            if (itemState == 0) { count++ }
                        }
                    }
                }

                taskColor = task.color
                taskName = task.name
                if (taskId !=0 && !document.querySelector('.delete-project')) {
                    const parentAdd = document.querySelector('.add-delete-project')
                    const deleteProject = `<div class="delete-project" but="task-removeProject">
                            <img src="css/img/delete.svg" alt="">
                        </div>`
                    parentAdd.insertAdjacentHTML('beforeend', deleteProject)  
                } 

                if (taskId == 0 || taskId == 'given') {
                    const removeButton = document.querySelector('.delete-project')
                    if (removeButton) { removeButton.remove() }
                }
              
                if (taskId != 0 && taskId != 'given') { 
                    isCircle = true 
                }

                const addProjectBut = document.querySelector('.add-task-but')
                
                if (taskId == 'given') {
                    addProjectBut.remove()
                    
                } else if (!addProjectBut) {
                    const addProjectRender = `<div but="items-create" class="add-task-but">
                        <div>Добавить задачу</div>
                    </div>`
                    document.querySelector('.add-delete-project').insertAdjacentHTML('afterbegin', addProjectRender)
                }

            } else {
                for (const itemId in task.items) if (task.items[itemId].state == 0) { count++ }
            }
                
            if (taskId != 0 && taskId != 'given') {
                projects += `<div class="project" but="task-render" projectId="${taskId}">
                <div class="project-color-name">
                    <div class="circle-block"><div class="project-circle" style="background: #${task.color}"></div></div>
                    <input type="color" class="input-color" but="task-chooseColor">
                    <div class="proj-text">${task.name}</div>
                </div>
                    <div class="counter">${count}</div>
                </div>`
            
            } else if (taskId == 0) {
                document.querySelector('.task-counter').innerHTML = count
            } else if (taskId == 'given') { givenCount = count }
        }
        const circle = `<div class="circle-block"><div class="project-circle main-circle" style="background: #${taskColor}"></div></div>
        <input type="color" class="input-color" but="task-chooseColor">`
        
        task.renderItems(isCircle, circle, myItems, taskName, doneItems, projects, constDef)
        if (tasksJson.user == 'admin') { 
            task.adminChanges(givenCount) 
        }
        const select = document.querySelector('[select]')
        if (select) { select.removeAttribute('select') }

        document.querySelectorAll('[but="task-render"]').forEach(element => {
            if (element.getAttribute('projectid') == constDef) { element.setAttribute('select', '') }
        })
        butListener()
    },

    renderItems: function(isCircle, circle, myItems, taskName, doneItems, projects, constDef) {
       
        const circleBlock = document.querySelector('.my-task-circle')
        const circleElement = circleBlock.querySelector('.circle-block')
        const colorElement = circleBlock.querySelector('.input-color')
        if (circleElement) {
            circleElement.remove()
            colorElement.remove()
        }
        if (isCircle) { circleBlock.insertAdjacentHTML('afterbegin', circle) } 

        document.querySelector('.actual-tasks').innerHTML = ''
        document.querySelector('.actual-tasks').insertAdjacentHTML('afterbegin', myItems)
        
        const taskInput = document.querySelector('.my-tasks-text-main')
        if (taskName) { taskInput.value = taskName }
        else taskInput.value = 'Мои задачи'
        
        if (taskInput.value == 'Мои задачи' || taskInput.value == 'Назначенные задачи') { taskInput.setAttribute('readonly', '') } 
        else { taskInput.removeAttribute('readonly') }

        document.querySelector('.done-tasks-items').innerHTML = ''
        document.querySelector('.done-tasks-items').insertAdjacentHTML('afterbegin', doneItems)

        const allProjects = document.querySelector('.all-projects')
        
        if (allProjects.childElementCount == 0) { allProjects.insertAdjacentHTML('afterbegin', projects) }
    
        task.updateProject()
        items.isCheck()
        items.updateItems()
        items.updateDate()
        items.updateDescription()
        items.showDateHover()
        calendar.checkDate()
        items.isEmptyTasks()
        butListener()
        inputsEventListener()
    },

    butAddProject: function() {
        const taskZone = document.querySelector('.task-zone')

        if (taskZone) { taskZone.remove() }

        const projectTask = document.createElement('div')
        projectTask.innerHTML = 
                `<div class="my-task-circle">
                    <input type="color" class="input-color" but="task-chooseColor">
                    <div class="circle-block"><div class="project-circle main-circle"></div></div>
                    <input type="text" class="my-tasks-text my-tasks-text-main" placeholder="Новый проект">
                </div>
                <div class="add-delete-project">
                    <div but="items-create" class="add-task-but">
                        <div>Добавить задачу</div>
                    </div>
                    <div class="delete-project" but="task-removeProject">
                        <img src="css/img/delete.svg" alt="">
                    </div>
                </div>`
        
        document.querySelector('.head-tasks').remove()
        document.querySelector('.tasks').insertAdjacentElement('afterbegin', projectTask)
        projectTask.classList.add('head-tasks')

        const projectName = projectTask.querySelector('input[class="my-tasks-text my-tasks-text-main"]')
        projectName.focus()

        const input = { project: 'Новый проект'}
        const inputsJson = JSON.stringify(input)
            
        fetch('/api/task.php?direction=addProject'+ '&data=' + inputsJson)
            .then(res => res.json())
            .then(json => {
                const project = document.createElement('div')
                project.innerHTML = `<div class="project-color-name">
                    <div class="project-circle"></div>
                    <input type="color" class="input-color" but="task-chooseColor">
                    <div class="proj-text">Новый проект</div>
                </div>
                <div class="counter">0</div>`

                project.classList.add('project')
                project.setAttribute('but', 'task-render')
                project.setAttribute('projectId', json)

                document.querySelector('.all-projects').appendChild(project)

                const select = document.querySelector('[select]')

                if (select) { select.removeAttribute('select') }
                project.setAttribute('select', '')
                
                sessionStorage.setItem('projectId', json)
               
                task.projects[json] = 'Новый проект'
                task.allTasks.projects[json] = {name: 'Новый проект', items: {}, color: ""}
            
                task.addBanner()
                setTimeout(() => { butListener() }, 0)
                items.updateItems()  
                task.updateProject()
                inputsEventListener()
                butListener()
        })      
    },

    butRemoveProject: function() {
            const projectId =  document.querySelector('div[select]').getAttribute('projectId')
            delete task.allTasks.projects[projectId]
            delete task.projects[projectId]
            fetch('/api/task.php?direction=deleteTask' + '&data=' + projectId)
                .then(res => res.text())
                .then(text => {
                    document.querySelector('.my-tasks-projects').dispatchEvent(new Event('click'))
                    sessionStorage.clear()

                    document.querySelectorAll('.project').forEach(element => {
                        if (element.getAttribute('projectId') == projectId) { element.remove() }
                    })
                })      
    },

    addBanner: function() { 
        const headTask = document.querySelector('.head-tasks')
        const projectTaskLogo = `<div class="task-zone">
        <div class="actual-tasks">
            <div class="greetings">
                <div class="project-task-logo">
                    <img src="css/img/project-task-logo.png" alt="" class="">
                </div>
                <div class="create-project-text">
                <div>Проект успешно создан!<br> Дайте ему имя и наполните задачами.</div>
                </div>
            </div>
        </div>
        </div>`
        headTask.insertAdjacentHTML('afterend', projectTaskLogo)

        const donePoints = document.createElement('div') 
        donePoints.innerHTML = `<div class="done-tasks-head" but="task-switch">
                <img src="css/img/project-down.svg" class="done-task-svg project-down rotate" alt="">
                <div class="flex-none">Выполненные задачи</div>
                <div class="done-tasks-border">
                </div>
            </div>
            <div class="done-tasks-items invisible"></div> `
        donePoints.classList.add('done-tasks')
        document.querySelector('.task-zone').appendChild(donePoints)
    },

    updateProject: function() {
        const task = document.querySelector('.my-tasks-text-main')
            task.addEventListener('blur', event => {
                const taskId = document.querySelector('div[select]').getAttribute('projectId')
                let projectName = event.target.value
                
                if (!event.target.value) {
                    projectName = 'Новый проект' 
                }
                this.projects[taskId] = projectName
                this.allTasks.projects[taskId].name = projectName

                if (taskId != 0) {
                    if (items.taskValue != event.target.value) {
                        items.taskValue = event.target.value   
                        const taskArr = { id: taskId, value: event.target.value }
                        const inputsJson = JSON.stringify(taskArr)
                        if (items.taskValue) {
                            fetch('/api/task.php?direction=updateProject'+ '&data=' + inputsJson)
                                .then(res => {
                                    document.querySelectorAll('.proj-text').forEach(element => {
                                        if (element.closest('div[projectId]').getAttribute('projectId') == taskId) {
                                        element.innerText = items.taskValue
                                        }
                                    })
                                })
                        }
                    }                         
                }
            }) 
    },

    butSwitch: function() {  
        if (this.parentElement == document.querySelector('.done-tasks')) {
            this.querySelector('.done-task-svg').classList.toggle('rotate')
            document.querySelector('.done-tasks-items').classList.toggle('invisible')
        } else if (this.parentElement.parentElement == document.querySelector('.projects-add')) {
            this.classList.toggle('rotate')
            document.querySelector('.all-projects').classList.toggle('invisible')
        } else {
            this.classList.toggle('rotate180')
            const parent = this.closest('div[item-id]')
            parent.querySelector('.textarea-task').classList.toggle('invisible')
        }
    },

    butChooseColor: function() {
        const parent = this.parentElement
        let parentId = this.parentElement.getAttribute('projectId')
    
        const colorBlock = parent.querySelector('.input-color')
        colorBlock.addEventListener('blur', event => {
            if ('choose' in event) { return }
            
            parent.querySelector('.project-circle').style.background = event.target.value
            if (this.parentElement.getAttribute('class') == "project") {
                document.querySelector('.main-circle').style.background = event.target.value
            } else {
                document.querySelectorAll('.project').forEach(element => {
                    parentId = document.querySelector('div[select]').getAttribute('projectId')
                    if (element.getAttribute('projectid') == parentId) { element.querySelector('.project-circle').style.background = event.target.value }
                })
            }
            task.allTasks.projects[parentId].color = event.target.value.slice(1)
            const color = event.target.value.slice(1)
            const colorObj = {projectId: parentId, color: color}
            const colorJSON = JSON.stringify(colorObj)
        
            fetch('/api/task.php?direction=updateColor'+ '&data=' + colorJSON) 

            event['choose'] = true
        })
    },

    counter: function(symbol, projectId) {
        const project = document.querySelector('div[select]') 
        const elCount = project.querySelector('.counter')
        let numCount = elCount.textContent

        if (symbol == 'plus') {
            numCount++
            elCount.innerText = numCount
        } else if (symbol == 'toggle') {
            task.counter('minus')
            document.querySelectorAll('.counter').forEach(element => {
                if (element.closest('div[projectid]').getAttribute('projectid') == projectId) {
                    let numToggleCount = element.textContent
                    numToggleCount++
                    element.innerText = numToggleCount 
                }
            })
            
        } else {
            numCount--
            elCount.innerText = numCount
        }
    },

    adminChanges: function(givenCount) {
        const changeUserHtml = `<div class="selected-user invisible"></div><div class="admin-changes" but="user-showAllUsers"></div>`
        document.querySelectorAll('.delete-point').forEach(element => {
            element.insertAdjacentHTML('beforebegin', changeUserHtml)
        }) 

        if (document.querySelector('.my-tasks-projects-given')) {return}
        const givenTask = `<div class="my-tasks-projects my-tasks-projects-given" but="task-render" projectid="given" given>
        <div class="project-color-name">
            <img src="css/img/user-trans.svg" alt="#" class="projects-icon">
            <div class="my-tasks-text-given">Назначенные задачи</div>
        </div>
            <div class="given-task-counter counter">0</div>
        </div>`
        document.querySelector('.my-tasks-projects').insertAdjacentHTML('afterend', givenTask)
        document.querySelector('.given-task-counter').innerText = givenCount
        
        butListener()
    },
    
    addToLocalStorage: function(projectId, projectName) {
        const localProjects = JSON.parse(localStorage.getItem('projects'))
        localProjects[projectId] = projectName
        localStorage.setItem('projects', JSON.stringify(localProjects))
    },

    butReloadPage: function() { location.reload() }

}

task.firstFetch()

const items = {
    taskValue: '',
    itemValue: { },
    itemDate: { },
    descriptions: {},

    butCreate: function() {
        const greetings = document.querySelector('.greetings')

        let emptyValue = false
        document.querySelectorAll('.item-input').forEach(element => {  
            if (!element.value) {
                const input = element.closest('div[class="task-item-render"]')
                element.focus()
                items.save(input)  
                emptyValue = true 
            }
        })
        if (emptyValue) { return }
        if (greetings) { greetings.remove() }
        
        const taskItem = document.createElement('div') 
        taskItem.innerHTML = `<div class="item-flex">
                    <div class="item-text" ischeck="">
                        <div class="inputs-flex">
                            <div class="checkbox-block">
                                <input type="checkbox" class="task-checkbox" id="check">
                                <label for="check" class="label-check"></label>
                            </div>
                            <input type="text" value="" class="item-input item-input-render" placeholder="Введите заголовок задачи">
                        </div>
                        <div class="flex-svg-date">
                            <div class="svg-down" but="task-switch">
                                <img src="css/img/project-down.svg" class="done-description-svg done-description-item" alt="">
                            </div>
                        </div>
                    </div>
                    <div class="buttons-flex">
                        <div class="move-in-project" but="items-itemMove"></div>
                        <div class="delete-point" but="items-removeItem">
                            <img src="css/img/delete.svg" alt="">
                        </div>
                    </div>
                </div>
                <textarea type="textarea" class="textarea-task textarea-task-render invisible" placeholder="Введите краткое описание задачи"></textarea>`

        
        if (user.role == 'admin') { 
            const changeUserHtml = `<div class="selected-user invisible"></div><div class="admin-changes" but="user-showAllUsers"></div>`
            taskItem.querySelector('.delete-point').insertAdjacentHTML('beforebegin', changeUserHtml)   
        }
        document.querySelector('.actual-tasks').appendChild(taskItem)

        taskItem.classList.add('task-item-render')
        taskItem.setAttribute('item-id', "")
        const inp = taskItem.querySelector('.item-input-render')
        inp.focus()
        items.save(inp)   
        items.isCheck()
        items.updateItems()
        items.isEmptyTasks()  
        inputsEventListener()
        butListener()
    },  

    save: function(inp) {
        inp.addEventListener('blur', event => {
            if ('check' in inp) { return }
        
            if (!inp.value) {
                // inp.closest('[item-id]').remove()
                // items.butCreate()
                return
            }
            const taskId = document.querySelector('div[select]').getAttribute('projectId')
            
            const addValues = {projectId: taskId, value: event.target.value}
            const inputsJson = JSON.stringify(addValues)
            if (addValues.value) {
                fetch('/api/item.php?direction=addItems'+ '&data=' + inputsJson) 
                    .then(res => res.json())
                    .then(json => {
                        task.allTasks.projects[taskId].items[json] = {name: event.target.value, description: "", date: "", state: 0} 
                        let taskItem = document.querySelector('.task-item-render')
    
                        const dateBlock = `<div class="day-month-item" but="calendar-render"></div><div class="datetime-block" but="calendar-render"></div> `
                        if (taskItem) {
                            taskItem.querySelector('.flex-svg-date').insertAdjacentHTML('beforeend', dateBlock)
                        
                            taskItem.setAttribute('item-id', json)
                            taskItem.querySelector('.task-checkbox').setAttribute('id', `check${json}`)
                            taskItem.querySelector('.label-check').setAttribute('for', `check${json}`)
                            taskItem.classList.remove('task-item-render')
                            taskItem.classList.add('task-item')
                            
                            let inputItem = document.querySelector('.item-input-render')
                            inputItem.classList.remove('item-input-render')
                            inputItem.classList.add('item-input')
        
                            items.descriptions[json[0]] = ''
                            items.itemValue[json[0]] = event.target.value
                            items.itemDate[json[0]] = ''
        
                            items.updateDescription(json[0])
                            butListener()
                            items.showDateHover()                         
                        }
                    })
                task.counter('plus')
            }   
            inp['check'] = true
        })   
    },

    butRemoveItem: function() {  
        const parent = this.closest('div[item-id]')
        const itemId = parent.getAttribute('item-id')

        const parentTask = document.querySelector('div[select]')
        const taskId = parentTask.getAttribute('projectid')
        delete task.allTasks.projects[taskId].items[itemId]

        items.remove(parent, itemId)
    },

    remove: function(parent, itemId ) {
        if (itemId) { 
            fetch('/api/item.php?direction=deleteItem' + '&data=' + itemId)
                .then(res => res.json())
                .then(json => {
                    if (parent.parentElement == document.querySelector('.actual-tasks')) {
                        task.counter('minus')
                    }
                    parent.remove()
                })
        }
    },

    updateItems: function() {
        document.querySelectorAll('.item-input').forEach(element => {
            element.addEventListener('blur', event => {
                
                const itemId = event.target.closest('div[item-id]').getAttribute('item-id')
                const parentId = document.querySelector('[select]').getAttribute('projectId')  
                for (let key in items.itemValue) {
                    if (key == itemId) { 
                        if (items.itemValue[key] != event.target.value) { 
                            items.itemValue[itemId] = event.target.value
                            const itemArr = { id: itemId, value: event.target.value }
                            const inputsJson = JSON.stringify(itemArr)
                            if (items.itemValue) {
                                fetch('/api/item.php?direction=updateItem'+ '&data=' + inputsJson) 
                            }  
                            task.allTasks.projects[parentId].items[itemId].name = event.target.value           
                        }
                    }
                } 
            })
        })
    },

    updateDescription: function(itemId) {
        let id = ''
        document.querySelectorAll('.textarea-task').forEach(element => {
            element.addEventListener('blur', event => {
                const parentId = event.target.closest('div[item-id]').getAttribute('item-id')
                const projectId = document.querySelector('[select]').getAttribute('projectId')  
                if (itemId) { id = itemId } 
                else { id = parentId }
                if (element.closest('div[item-id').getAttribute('item-id') == id) {
                    for (const descId in items.descriptions) {
                        if (id == descId) {
                            if (items.descriptions[descId] != event.target.value) {
                                items.descriptions[id] = event.target.value
                    
                                const addValues = { itemId: id }
                                const descriptionValue = encodeURIComponent(event.target.value)
                                items.descriptions[id] = event.target.value
                                const inputsJson = JSON.stringify(addValues)
                                fetch('/api/item.php?direction=updateDescription'+ '&data=' + inputsJson + '&description=' + descriptionValue)
                                
                                task.allTasks.projects[projectId].items[parentId].description = event.target.value    
                            }
                        }
                    }
                }
            })
        })
    },

    isCheck: function() {
        const actual = document.querySelector('.actual-tasks')
        document.querySelectorAll('input[type="checkbox"]').forEach(element => {
            if ('checkListener' in element) { return }
    
            element.addEventListener('change', event => {
                const checkParent = element.closest('div[item-id]')
                const itemId = checkParent.getAttribute('item-id')
                const checkInput = checkParent.querySelector('.item-input')
                const projectId = document.querySelector('[select]').getAttribute('projectid')
        
                if (element.checked) {
                    task.allTasks.projects[projectId].items[itemId].state = '1'
                    checkParent.classList.add('task-done-item') 
                    checkInput.classList.add('item-done-text')
                    const before = document.querySelector('.done-tasks-items')
                    before.insertAdjacentElement('afterbegin', checkParent)

                    task.counter('minus')
                    items.isEmptyTasks()     
                    items.saveCheck('Select', itemId)
                } else { 
                    task.allTasks.projects[projectId].items[itemId].state = 0
                    task.counter('plus')
                    items.saveCheck('Unselect', itemId)
                    
                    checkParent.classList.remove('task-done-item')
                    checkInput.classList.remove('item-done-text')
                    actual.insertAdjacentElement('beforeend', checkParent)
                    items.showDateHover()
                    calendar.checkDate()
                    butListener()
                    items.isEmptyTasks()
                }
            })
            element['checkListener'] = true   
        })
        document.querySelectorAll('div[ischeck]').forEach(element => {
            if (element.getAttribute('ischeck') == 1) {
                element.lastElementChild.classList.add('done-point')
                element.children[0].setAttribute('checked', '') 
            }
        })      
    },

    saveCheck: function(state, value) {
        if (value) {
            const inputsJson = JSON.stringify(value)
            fetch('/api/item.php?direction=check' + state + '&data=' + inputsJson)
        }
    },

    isEmptyTasks: function() {
        const actual = document.querySelector('.actual-tasks')
        const doneTasksBlock = document.querySelector('.done-tasks-items')

        const tasksDone = `<div class="astronaut">
                <img src="css/img/astronaut.png" alt="">
                <div>Вы выполнили все поставленные задачи</div>
            </div>`
        const astronaut = document.querySelector('.astronaut')
        
        if (doneTasksBlock) {
            if (doneTasksBlock.childElementCount > 0) {
                if (actual.childElementCount == 0) {
                    actual.insertAdjacentHTML('afterbegin', tasksDone)
                } else if (astronaut) { astronaut.remove() }
            } else if (astronaut) { astronaut.remove() }
        }
    },

    updateDate: function(selectDay, fullDate) {
        
        if (selectDay) {    
            const parent = selectDay.closest('[item-id]')
            parent.querySelector('.day-month-item').textContent = calendar.splitDate(fullDate)
            const itemId = parent.getAttribute('item-id')
            const itemDate = { date: fullDate, id: itemId }
            const inputsJson = JSON.stringify(itemDate)
            if (itemDate.date) {
                for (let key in items.itemDate) {
                    if (key == itemId) {
                        if (items.itemDate[key] != fullDate){ 
                            items.itemDate[itemId] = fullDate
                            fetch('/api/item.php?direction=updateDate'+ '&data=' + inputsJson)
                        }
                    }
                }
            }   
            items.showDateHover()
        }
    },

    showDateHover: function() {
        document.querySelectorAll('.day-month-item').forEach(element => {
            if (!element.innerHTML) { element.classList.add('invisible') }
            else { element.classList.remove('invisible') }
        })
    },
    
    dateSort: function(overDate, clearDate) {
        overDate.forEach(element => {
            document.querySelectorAll('.task-item').forEach(el => {
                if (el.getAttribute('item-id') == element) {
                    el.classList.add('task-overdue')
                    el.querySelector('.item-input').classList.add('input-overdue')
                    const timeBlock = el.querySelector('.datetime-block')
                    if (timeBlock) { 
                        timeBlock.classList.add('datetime-block-overdue') 
                    }
                    
                    const dayMonth = el.querySelector('.day-month-item')
                    if (dayMonth) {
                        dayMonth.classList.remove('invisible')
                        dayMonth.classList.add('day-month-item-overdue')
                    }
                }
            })
            
        })

        clearDate.forEach(element => {
            document.querySelectorAll('.task-item').forEach(el => {
                if (el.getAttribute('item-id') == element && el.classList.contains('task-overdue')) {
                    el.classList.remove('task-overdue')
                    el.querySelector('.item-input').classList.remove('input-overdue')
                    const timeBlock = el.querySelector('[but="calendar-render"]')
                    if (timeBlock) {
                        timeBlock.classList.remove('datetime-block-overdue')
                    }
                    const dayMonth = el.querySelector('.day-month-item')
                    if (dayMonth) {
                        dayMonth.classList.remove('invisible')
                        dayMonth.classList.remove('day-month-item-overdue')
                    }
                }
            })
        })
    },

    butItemMove: function() {
        let projects = ''

        let smallProjects = document.querySelector('.small-projects')
        if (smallProjects) { 
            smallProjects.remove() 
        } else if (task.projects) {
            if ('0' in task.projects) { task.projects[0] = {name: 'Мои задачи'} }

            for (const taskId in task.projects) {
                let taskName = task.projects[taskId]
                if (taskId == 0) { taskName = 'Мои задачи' }
                if (taskId != 'given') {
                    projects += `<div  class="one-small-project" projectId="${taskId}" but="items-toggleItem">
                                        <div>${taskName}</div>
                                    </div>`
                }    
            }

            let projectsBlock = document.createElement('div')
            projectsBlock.innerHTML = projects

            projectsBlock.classList.add('small-projects')
            this.insertAdjacentElement('beforeend', projectsBlock)
            
            document.addEventListener('click', event => {
                
                if (!event.target.closest('.move-in-project') ) {
                    const taskItemSmall = document.querySelector('.small-projects')
                    if (taskItemSmall) {
                        taskItemSmall.remove()
                    } 
                }
            })
            butListener()  
        } 
    },

    butToggleItem: function() {
        const projectId = this.getAttribute('projectid')
        const thisProjectId = document.querySelector('div[select]').getAttribute('projectid')
        if (projectId == thisProjectId) { 
            document.querySelector('.small-projects').remove()
            return 
        }
        const parentItem = this.closest('div[item-id]')
        const itemId = parentItem.getAttribute('item-id')
        fetch('/api/item.php?direction=toggleItem&data=' + JSON.stringify({projectId: projectId, itemId: itemId}))
        parentItem.remove()
        if (!this.closest('div[item-id]').classList.contains('task-done-item')) {
            task.counter('toggle', projectId)  
        }
        
        const item = task.allTasks.projects[thisProjectId].items[itemId]
        
        task.allTasks.projects[projectId].items[itemId] = {name: item.name, description: item.description, date: item.date, state: item.state, id: item.id}
        delete task.allTasks.projects[thisProjectId].items[itemId]
    },

    sortItems: function() {
        if (!('0' in task.allTasks.projects)) { task.allTasks.projects[0] = {name: 'Мои задачи'} }

        for (const allId in task.allTasks.projects) {
            if (!task.allTasks.projects[allId].items) { task.allTasks.projects[allId].items = {} }

            for(const itemId in task.allTasks.projects[allId].items) {
                const item = task.allTasks.projects[allId].items[itemId]
            } 
        }

        if (!task.allTasks.projects.given && user.role == 'admin') {
            task.allTasks.projects['given'] = {'items': {}}
            task.allTasks.projects['given']['name'] = 'Назначенные задачи'
        }
    },
    
    showSelectedUser: function() {
        if (document.querySelector('[select]').hasAttribute('given')) {
            const allItems = document.querySelectorAll('.task-item')
            allItems.forEach(element => {
                const elementId = element.getAttribute('item-id')
                const givenItems = task.allTasks.projects.given.items
                const selectedBlock = element.querySelector('.selected-user')
                for(const itemId in givenItems) {
                    if (itemId == elementId) {
                        selectedBlock.innerText = user.users[givenItems[itemId].id].email
                    }
                }
                selectedBlock.classList.remove('invisible')
           })

        const moveInProjectBut = document.querySelectorAll('.move-in-project')
        moveInProjectBut.forEach(element => { element.remove() })
        }
    }
}

const calendar = {
    monthArr: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
    thisMonth: '',
    thisYear: '',

    butRender: function() {
        const calendarBlock = document.querySelector('.calendar')
        if (calendarBlock) { 
            calendarBlock.remove() 
        } 
        else {
            const parentBlock = this.closest('.flex-svg-date')
            const newCalendar = `<div class="calendar">
                <div class="monthYear">
                    <div class="prev"><img src="css/img/prev.svg" alt=""></div>
                    <div class="myBlock">
                        <div class="month"></div>
                        <div class="year"></div>
                    </div>
                    <div class="next"><img src="css/img/next.svg" alt=""></div>
                </div>
                <div class="week">
                    <div>Пн</div>
                    <div>Вт</div>
                    <div>Ср</div>
                    <div>Чт</div>
                    <div>Пт</div>
                    <div>Сб</div>
                    <div>Вс</div>
                </div>
                <div class="days"></div>
            </div>`
    
            parentBlock.insertAdjacentHTML('beforeend', newCalendar)
            calendar.calendarRender()
            calendar.switchCalendar()
            butListener()
        }
        document.addEventListener('click', event => {
                
            if (!event.target.closest('.flex-svg-date') ) {
                const calendarSmall = document.querySelector('.calendar')
                if (calendarSmall) {
                    calendarSmall.remove()
                } 
            }
        })
        
    },

    getDaysOfMonth: function(year, month) {  // получаем количество дней в месяце
        return new Date(year, month + 1, 0).getDate()
    },
    
    calendarRender: function(thisM, thisY) {

        const calDays = document.querySelector('.days') 
        const blockYear = document.querySelector('.year')
        const blockMonth = document.querySelector('.month')
        
        if (thisM == 12) { thisM = 0 }
        else if (thisM == -1) { thisM = 11 }
    
        if (thisM || thisM === 0) {
            blockMonth.innerHTML = ''
            blockYear.innerHTML = ''
            calDays.innerHTML = ''
            calendar.thisMonth = thisM

        } else { calendar.thisMonth = new Date().getMonth() }
    
        if (thisY) { calendar.thisYear = thisY }
        else { calendar.thisYear = new Date().getFullYear() }
    
        const firstDayInWeek = new Date(calendar.thisYear, calendar.thisMonth, 1).getDay() - 1 // номер дня недели первого дня месяца минус 1
        const prevMonth = calendar.getDaysOfMonth(calendar.thisYear, calendar.thisMonth-1) // количество дней в предыдущем месяце
        let days = ''
        let firstPoint = ''
    
        if (firstDayInWeek == -1) {
            firstPoint = prevMonth - 5
        } else {
            firstPoint = prevMonth - firstDayInWeek + 1 // берем день начала рендера для таблицы календаря
        }
    
        const lastDayInWeek = new Date(calendar.thisYear, calendar.thisMonth + 1, 0).getDay() // номер дня недели последнего дня этого месяца
    
        const nextMonth = 7 - lastDayInWeek // оставшиеся дни для заполнения таблицы календаря
    
        const thisDay = new Date().getDate()
    
        for (let i = firstPoint; i <= prevMonth ; i++) {
            days += `<div class="calendar-day gray-day pre-month" but="calendar-select">${i}</div>`
        }
        for (let i = 1; i <= calendar.getDaysOfMonth(calendar.thisYear, calendar.thisMonth); i++) {
            days += `<div class="calendar-day" but="calendar-select">${i}</div>`
        }
        for (let i = 1; i <= nextMonth; i++) {
            days += `<div class="calendar-day gray-day next-month" but="calendar-select">${i}</div>`
        }
          
        blockYear.insertAdjacentHTML('afterbegin', calendar.thisYear)
        blockMonth.insertAdjacentHTML('afterbegin', calendar.monthArr[calendar.thisMonth])
        calDays.insertAdjacentHTML('afterbegin', days)
    
        document.querySelectorAll('.calendar-day').forEach(element => {
            const trueMonth = new Date().getMonth()
            if (element.textContent == thisDay && calendar.thisMonth == trueMonth) {
                element.classList.add('this-day')
                const dot = '<div class="dot-day"></div>'
                element.insertAdjacentHTML('beforeend', dot)
            }
        })
        butListener()     
    },

    switchCalendar: function() {
        document.querySelector('.next').addEventListener('click', event => {
            if (calendar.thisMonth == 11) { calendar.thisYear = calendar.thisYear + 1 }
            calendar.calendarRender(calendar.thisMonth + 1, calendar.thisYear)     
        })
        document.querySelector('.prev').addEventListener('click', event => {
            if (calendar.thisMonth == 0) { calendar.thisYear = calendar.thisYear - 1 }
            calendar.calendarRender(calendar.thisMonth - 1, calendar.thisYear)
        })
    },

    butSelect: function() {
        this.classList.add('dateSelected')

        let day = this.textContent
        let month = ''
        if (this.classList.contains('pre-month')) { month = calendar.thisMonth }
        else if (this.classList.contains('next-month')) { month = calendar.thisMonth + 2 }
        else { month = calendar.thisMonth + 1 }
        let year = calendar.thisYear

        const fullDate = year + '-' + month + '-' + day
        
        if (day >= new Date().getDate() && month == new Date().getMonth() + 1 || month > new Date().getMonth() + 1 && year >= new Date().getFullYear() || year > new Date().getFullYear()) {
            items.updateDate(this, fullDate)
            document.querySelector('.calendar').remove()
        } else {
            this.classList.remove('dateSelected')
            this.classList.add('day-err')

            setTimeout(function() {
                document.querySelectorAll('.calendar-day').forEach(e => {
                    e.classList.remove('day-err')
                })
            }, 1000)
        }
        calendar.checkDate()
    },

    splitDate: function(itemDate) {
        if (itemDate) {
            const dateArr = itemDate.split('-')
            let month = ''
            month = dateArr[1]
            if (month.length == 1) { month = '0' + month }
            const returnValue = dateArr[2] + '.' + month
            return returnValue
        }
    },

    checkDate: function() {

        let overDate = []
        let clearDate = []
        
        for (let itemId in items.itemDate) {
            const date = items.itemDate[itemId]
            const dateArr = date.split('-')
 
            let month = ''
            const day = dateArr[2]
            const year = dateArr[0] 

            if (dateArr[1]) {
                if (dateArr[1].startsWith(0)) { month = dateArr[1].slice(1)  }
                else { month = dateArr[1] }
        
                if (day <= new Date().getDate() && month <= new Date().getMonth() + 1 && year <= new Date().getFullYear()) {
                    overDate.push(itemId)

                } else { clearDate.push(itemId) }
            }
        }
        items.dateSort(overDate, clearDate)
    },
}