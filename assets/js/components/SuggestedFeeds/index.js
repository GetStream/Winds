import React, { Component } from 'react'
import ReactDOM from 'react-dom'

class SuggestedFeeds extends Component {

    render() {

        return (
            <div className="suggested-feeds">
                <div className="cta text-uppercase">
                    Suggestions
                </div>
                <div className="suggestions">
                    <ul className="list-inline">
                        <li>
                            <div className="remove">
                                <svg width="9px" height="9px" viewBox="147 15 9 9">
                                    <path d="M152.45,19.03525 L154.925,16.56025 C155.121,16.36525 155.121,16.04825 154.925,15.85325 L154.218,15.14625 C154.023,14.95125 153.706,14.95125 153.511,15.14625 L151.036,17.62125 L148.561,15.14625 C148.366,14.95125 148.049,14.95125 147.854,15.14625 L147.147,15.85325 C146.951,16.04825 146.951,16.36525 147.147,16.56025 L149.622,19.03525 L147.147,21.51025 C146.951,21.70525 146.951,22.02225 147.147,22.21725 L147.854,22.92425 C148.049,23.11925 148.366,23.11925 148.561,22.92425 L151.036,20.44925 L153.511,22.92425 C153.706,23.11925 154.023,23.11925 154.218,22.92425 L154.925,22.21725 C155.121,22.02125 155.121,21.70525 154.925,21.51025 L152.45,19.03525 Z" id="X_1" stroke="none" fillOpacity="0.599999964" fill="#99A9B3" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <div className="circle">
                                <div className="favicon">
                                    <svg width="32px" height="32px" viewBox="69 49 32 32">
                                        <image id="favicons" stroke="none" fill="none" x="69" y="49" width="32" height="32" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABGdBTUEAA1teXP8meAAAALFJREFUKBXNUcsNhCAQFV3iwUIoiYooxhaoQr1xMCaGGoBEo/s2JuM4l73K6X1mhsdQVa87iidSStV1zRXg4zjO8xTij6J6WRZ44szzzKfcNzRNs++7tTaEQPOMMX3fd12XUrrED3kXQPU4jkLkVCbm3h+MSCL9RXPOWmtqlpGcczFGsvEq7/22baTIhmma+KMxfl1Xqn4ArBWeSDUMw6MI2+cc+27bFp0k4tdKKUTfCb4SvncHSFqGWgAAAABJRU5ErkJggg=="></image>
                                    </svg>
                                </div>
                            </div>
                            <div className="metadata">
                                <a href="#" className="name">
                                    <p>Engadget</p>
                                </a>
                                <a href="#" className="follow text-uppercase">
                                    Follow
                                </a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        )

    }
}

require('./styles.scss')

export default SuggestedFeeds
