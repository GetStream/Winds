import React, { Component } from 'react'
import { browserHistory } from 'react-router'

import normalizeUrl from 'normalize-url'

class SocialSharing extends Component {

    state = {
        hidden: true,
    }

    handleFacebook = (e) => {

        e.preventDefault()

        FB.ui({
            method: 'share',
            href: this.props.url,
        }, function(response) {
            console.log(response)
        })

    }

    handleTwitter = (e) => {

        e.preventDefault()

        let intentUrl = `https://twitter.com/intent/tweet`
        let articleUrl = `?url=${this.props.url}`
        let url = `&text=${encodeURI(this.props.title)}`
        let hashtags = `&hashtags=winds`
        let via = `&via=getstream_io`

        let intent = intentUrl + articleUrl + url + hashtags + via

        window.open(intent, '_blank', 'width=600,height=600')

    }

    handleGoogle = (e) => {

        e.preventDefault()

        let intentUrl = `https://plus.google.com/share`
        let articleUrl = `?url=${this.props.url}`

        let intent = intentUrl + articleUrl

        window.open(intent, '_blank', 'width=600,height=600')

    }

    handlePinterest = (e) => {

        e.preventDefault()

        let intentUrl = `http://pinterest.com/pin/create/button`
        let articleUrl = `?url=${this.props.url}`

        let intent = intentUrl + articleUrl

        window.open(intent, '_blank', 'width=800,height=600')

    }

    handlePocket = (e) => {

        e.preventDefault()

        let intentUrl = `https://getpocket.com/save`
        let articleUrl = `?url=${encodeURI(this.props.url)}`
        let title = `&title=${encodeURI(this.props.title)}`

        let intent = intentUrl + articleUrl + title

        window.open(intent, '_blank', 'width=800,height=600')

    }

    render() {

        return (
            <div className="social-sharing">
                <svg width="16px" height="16px" viewBox="1 378 16 16">
                    <g id="ic_share_black_18px-(1)" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(1.000000, 378.000000)">
                        <g id="Group">
                            <polygon id="Shape" points="0 0 16 0 16 16 0 16"></polygon>
                            <path d="M12,10.72 C11.4933333,10.72 11.04,10.92 10.6933333,11.2333333 L5.94,8.46666667 C5.97333333,8.31333333 6,8.16 6,8 C6,7.84 5.97333333,7.68666667 5.94,7.53333333 L10.64,4.79333333 C11,5.12666667 11.4733333,5.33333333 12,5.33333333 C13.1066667,5.33333333 14,4.44 14,3.33333333 C14,2.22666667 13.1066667,1.33333333 12,1.33333333 C10.8933333,1.33333333 10,2.22666667 10,3.33333333 C10,3.49333333 10.0266667,3.64666667 10.06,3.8 L5.36,6.54 C5,6.20666667 4.52666667,6 4,6 C2.89333333,6 2,6.89333333 2,8 C2,9.10666667 2.89333333,10 4,10 C4.52666667,10 5,9.79333333 5.36,9.46 L10.1066667,12.2333333 C10.0733333,12.3733333 10.0533333,12.52 10.0533333,12.6666667 C10.0533333,13.74 10.9266667,14.6133333 12,14.6133333 C13.0733333,14.6133333 13.9466667,13.74 13.9466667,12.6666667 C13.9466667,11.5933333 13.0733333,10.72 12,10.72 Z" id="Shape" fill="#99A9B3"></path>
                        </g>
                    </g>
                </svg>
                <div className="outer-container">
                    <div className="arrow-up"></div>
                    <ul className="list-unstyled inner-container">
                        <li onClick={this.handleFacebook}>
                            <div className="icon">
                                <svg width="9px" height="16px" viewBox="20 22 9 16">
                                    <path d="M27,25 C26.7,25 26,25.472 26,26 L26,28 L29,28 L29,31 L26,31 L26,38 L23,38 L23,31 L20,31 L20,28 L23,28 L23,26 C23,23.794 24.961,22 27.062,22 L29,22 L29,25 L27,25 Z" id="Shape" stroke="none" fill="#99A9B3" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <div className="network">Facebook</div>
                        </li>
                        <li onClick={this.handleTwitter}>
                            <div className="icon">
                                <svg width="16px" height="14px" viewBox="17 79 16 14">
                                    <path d="M32.996,80.538 C32.407,80.8 31.775,80.976 31.111,81.056 C31.789,80.65 32.308,80.007 32.554,79.24 C31.919,79.617 31.216,79.89 30.469,80.037 C29.87,79.398 29.017,79 28.073,79 C26.26,79 24.79,80.471 24.79,82.283 C24.79,82.541 24.819,82.791 24.875,83.031 C22.147,82.894 19.728,81.588 18.108,79.601 C17.827,80.085 17.665,80.65 17.665,81.251 C17.665,82.39 18.423,83.394 19.304,83.983 C18.766,83.965 17.995,83.817 17.995,83.571 L17.995,83.614 C17.995,85.204 18.948,86.53 20.449,86.833 C20.174,86.907 19.795,86.948 19.495,86.948 C19.283,86.948 19.034,86.927 18.832,86.887 C19.25,88.192 20.44,89.141 21.876,89.168 C20.753,90.047 19.326,90.572 17.789,90.572 C17.523,90.572 17.257,90.556 17,90.527 C18.453,91.457 20.175,92.002 22.029,92.002 C28.068,92.002 31.367,87 31.367,82.662 C31.367,82.519 31.363,82.377 31.356,82.236 C32,81.774 32.557,81.196 32.996,80.538 L32.996,80.538 Z" id="Shape" stroke="none" fill="#99A9B3" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <div className="network">Twitter</div>
                        </li>
                        <li onClick={this.handleGoogle}>
                            <div className="icon">
                                <svg width="16px" height="16px" viewBox="16 133 16 16">
                                    <g id="googleplusicon" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(16.000000, 133.000000)">
                                        <path d="M8.00571429,0.0114285714 C3.59028571,0.0114285714 0.0182857143,3.58285714 0.0182857143,8 C0.0182857143,12.4171429 3.58971429,15.9885714 8.00571429,15.9885714 C12.6171429,15.9885714 15.6742857,12.7485714 15.6742857,8.18285714 C15.6742857,7.65714286 15.6742857,7.25714286 15.5485714,6.85714286 L8.00571429,6.85714286 L8.00571429,9.6 L12.5371429,9.6 C12.3542857,10.7714286 11.1657143,13.0457143 8.00571429,13.0457143 C5.28,13.0457143 3.05371429,10.7828571 3.05371429,8 C3.05371429,5.21714286 5.28,2.95428571 8.00571429,2.95428571 C9.56,2.95428571 10.6,3.61714286 11.1885714,4.18857143 L13.36,2.10285714 C11.9657143,0.8 10.1657143,0.0114285714 8.00571429,0.0114285714 L8.00571429,0.0114285714 Z" id="Shape" fill="#99A9B3"></path>
                                    </g>
                                </svg>
                            </div>
                            <div className="network">Google</div>
                        </li>
                        <li onClick={this.handlePinterest}>
                            <div className="icon">
                                <svg width="13px" height="16px" viewBox="17 190 13 16">
                                    <path d="M21.9335225,200.581764 C21.5275225,202.784764 21.0335225,204.895764 19.5675225,205.999764 C19.1155225,202.670764 20.2325225,200.170764 20.7505225,197.515764 C19.8665225,195.972764 20.8565225,192.866764 22.7215225,193.631764 C25.0155225,194.573764 20.7345225,199.370764 23.6085225,199.969764 C26.6095225,200.594764 27.8335225,194.568764 25.9735225,192.609764 C23.2855225,189.780764 18.1475225,192.545764 18.7795225,196.595764 C18.9335225,197.586764 19.9195225,197.887764 19.1735225,199.253764 C17.4535225,198.857764 16.9395225,197.449764 17.0055225,195.573764 C17.1115225,192.502764 19.6665225,190.351764 22.2285225,190.053764 C25.4685225,189.677764 28.5095225,191.287764 28.9295225,194.449764 C29.4025225,198.017764 27.4675225,201.882764 24.0025225,201.604764 C23.0635225,201.528764 22.6685225,201.045764 21.9335225,200.581764 L21.9335225,200.581764 Z" id="Shape" stroke="none" fill="#99A9B3" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <div className="network">Pinterest</div>
                        </li>
                        <li onClick={this.handlePocket}>
                            <div className="icon">
                                <svg width="18px" height="16px" viewBox="0 0 18 16">
                                    <g id="-share" stroke="none" stroke-width="1" fill="none" fillRule="evenodd">
                                        <g id="secondary-actions" transform="translate(-341.000000, -888.000000)" fill="#99A9B3">
                                            <g id="*ix:-share-menu" transform="translate(325.000000, 640.000000)">
                                                <path d="M17.5609552,248.028179 C16.5947861,248.091144 16.0098308,248.642706 16.0098308,249.623721 L16.0098308,255.498786 C16.0098308,260.270647 20.7557811,264.020736 24.8612935,263.991124 C29.4776517,263.957811 33.7423682,260.059622 33.7423682,255.498786 L33.7423682,249.623721 C33.7423682,248.639005 33.1204378,248.083701 32.1468259,248.028179 L17.5609552,248.028179 L17.5609552,248.028179 Z M21.2999801,252.807443 L24.8612935,256.191045 L28.4263085,252.807443 C30.0218507,252.137393 30.7178109,253.958766 30.0625672,254.491861 L25.4202985,258.923104 C25.2685373,259.067502 24.457791,259.067502 24.3060299,258.923104 L19.6637214,254.491821 C19.0380498,253.903204 19.8524975,252.052219 21.2999801,252.807443 L21.2999801,252.807443 Z" id="pocket-logo"></path>
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <div className="network">Pocket</div>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}

require('./styles.scss')

export default SocialSharing
