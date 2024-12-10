# Oh My Zsh plugins for development
plugins=(
    git
    zsh-autosuggestions
    zsh-syntax-highlighting
    web-search
    docker
    npm
    copypath
    copyfile
    history
    vscode
    colored-man-pages
    command-not-found
    dirhistory
    jsontools
)

# Theme configuration
ZSH_THEME="powerlevel10k/powerlevel10k"

# Enhanced command highlighting
ZSH_HIGHLIGHT_HIGHLIGHTERS=(main brackets pattern cursor)

# Git shortcuts with color output
alias gst="git status -sb"
alias ga="git add"
alias gc="git commit"
alias gp="git push"
alias gpl="git pull"
alias glog="git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'"

# Development shortcuts
alias dc="docker-compose"
alias k="kubectl"
alias py="python3"
alias npm-list="npm list -g --depth=0"

# Directory navigation
alias ..="cd .."
alias ...="cd ../.."
alias ll="ls -la"
alias l="ls -lF"

# Quick edit configuration
alias zshconfig="code ~/.zshrc"
alias reload="source ~/.zshrc"

# Enhanced history configuration
HISTSIZE=10000
SAVEHIST=10000
setopt SHARE_HISTORY
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_FIND_NO_DUPS

# Auto-completion settings
zstyle ':completion:*' menu select
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}'
