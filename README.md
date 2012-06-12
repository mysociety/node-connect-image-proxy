# Middleware for proxying and manipulating images

This module allows you to manipulate and convert images on the fly.

It provides:

  * Resizing of images
  * Conversion of images to grayscale
  * Conversion of images into different formats


## Installation

    npm install connect-image-proxy


## Usage

  * Resize: hostname/route/?url=[url]&resize=1&height=[height]&width=[width]
  * Grayscale: hostname/route/?url=[url]&grayscale=1
  * Conversion [JPG, PNG, GIF]: hostname/route/?url=[url]&format=[format]
  * Conversion + Grayscale + Resize: hostname/route/?url=[url]&format=png&grayscale=1&resize=1&height=[height]&width=[width]

