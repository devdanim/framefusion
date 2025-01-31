FROM ubuntu:mantic

WORKDIR /ffmpeg-temp

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get -y install wget libavcodec-dev libavformat-dev libavdevice-dev libavfilter-dev libavutil-dev libpostproc-dev libswresample-dev libswscale-dev
# When host is ARM (M1), the ubuntu image needs a few more dependencies
# RUN apt-get update && apt-get -y install wget xz-utils python3 build-essential pkg-config libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

#
# Install node
#
WORKDIR /node-temp

RUN wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

RUN . "$HOME/.nvm/nvm.sh"\
    && nvm install 20\
    && nvm use 20\
    && npm install --global yarn

ADD . /framefusion
WORKDIR /framefusion

ENTRYPOINT . "$HOME/.nvm/nvm.sh" && yarn install --frozen-lockfile && yarn run test run && yarn run lint