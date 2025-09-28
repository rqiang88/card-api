FROM node:22.16

ARG UID=1001
ARG GID=1001

# 修改node用户的UID和GID以匹配宿主机
RUN groupmod -g ${GID} node
RUN usermod -u ${UID} node

# 创建必要的目录并设置权限
RUN mkdir -p /home/node/.ssh /home/node/.npm /home/node/.pnpm-store
RUN chown -R ${UID}:${GID} /home/node

USER node

ARG PROJECT=react
WORKDIR /home/node/${PROJECT}
