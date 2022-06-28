<?php
if ($user = User::get()) { $email = $user['email']; }

$main = '<div class="header">
        <div class="logo-header" but="task-reloadPage">
            <img src="css/img/logo-header.svg" class="logo-vec-header" alt="">
            <img src="css/img/todogram.svg" class="todogram-logo" alt="">
        </div>
        <div class="email-exit">
            <div class="user-email">'.$email.'</div>
            <div class="exit" but="userExit">   
                <img src="css/img/exit-icon.svg" alt="" class="icon-exit">
            </div>
        </div>
    </div>
    <main class="main">
        <div class="main-projects">

            <div class="my-tasks-projects" but="task-render" select="1">
                <img src="css/img/projects-icon.svg" alt="#" class="projects-icon">
                <div class="my-tasks-text">Мои задачи</div>
                <div class="task-counter counter"></div>
            </div>
            <div class="projects-add">
                <img src="css/img/project-down.svg" alt="" class="project-down" but="task-switch">
                <div class="projects-text">Проекты</div>
                <div but="task-addProject">
                    <img src="css/img/add-project.svg" alt="" class="add-project-icon">
                </div>
            </div>

            <div class="all-projects"></div>
        </div>
        <div class="tasks">
            <div class="head-tasks">
                <div class="my-task-circle">
                    <input type="text" class="my-tasks-text my-tasks-text-main">
                </div>
                <div class="add-delete-project">
                    <div but="items-create" class="add-task-but">
                        <div>Добавить задачу</div>
                    </div>
                </div>
            </div>

            <div class="task-zone">
                <div class="actual-tasks">
                </div>
                <div class="done-tasks">
                    <div class="done-tasks-head" but="task-switch">
                        <img src="css/img/project-down.svg" class="done-task-svg project-down rotate" alt="">
                        <div class="flex-none">Выполненные задачи</div>
                        <div class="done-tasks-border"></div>
                    </div>
                    
                    <div class="done-tasks-items invisible"></div> 
                </div>
            </div>
        </div>
        <div class="chat"></div>   
    </main>';
    
$script .= '<script src="/js/content.js"></script>';