import axios, { AxiosRequestConfig, Method } from "axios";
import { useEffect, useState } from "react";

import './App.scss';

function getOptions(year: '2021' | '2018'): AxiosRequestConfig {
    return {
        method: 'GET',
        url: `https://data.nba.net/data/10s/prod/v1/${year}/players.json`
    }
}

function getImage(id: string): string {
    return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${id}.png`
}

export function App() {
    const [activeRoster, setActiveRoster] = useState<any[]>(undefined);

    const [allPlayers, setAllPlayers] = useState<any[]>(undefined);
    const [activePlayerIdx, setActivePlayerIdx] = useState<number>(0);

    const [answer, setAnswer] = useState<'yes' | 'no'>(undefined);

    const activePlayer = () => {
        return allPlayers ? allPlayers[activePlayerIdx] : null;
    }

    const isCorrect = (): boolean => {
        return (answer === 'yes' && activePlayer().inTheLeague) || (answer === 'no' && !activePlayer().inTheLeague)
    }

    const nextPlayer = (): void => {
        setActivePlayerIdx(activePlayerIdx + 1);
        setAnswer(undefined);
    }

    useEffect(() => {
        axios
            .request(getOptions('2021'))
            .then((response) => {
                setActiveRoster(response.data.league.standard);
            })
            .catch(function (error) {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        if (activeRoster) {
            axios
                .request(getOptions('2018'))
                .then((response) => {
                    const players = response.data.league.standard
                        .filter(player => parseInt(player.yearsPro, 10) > 7 &&
                            player.personId !== '201142' &&
                            player.personId !== '2544' &&
                            player.personId !== '201939' &&
                            player.personId !== '201566'
                        )
                        .map(player => ({
                            ...player,
                            inTheLeague: !!activeRoster.find(activePlayer => player.personId === activePlayer.personId && activePlayer.isActive)
                        }))
                        .sort(() => .5 - Math.random());
                    
                    console.log(players)
                    setAllPlayers(players);
                })
                .catch(function (error) {
                    console.error(error);
                });
        }
    }, [activeRoster]);

    return (
        <div className="Canvas">
            {activePlayer() && (
                <>
                    <section className="Score">

                    </section>

                    <div
                        key={activePlayer().personId}
                        className="Player">
                        <h1 className="Text">Is <strong>{activePlayer().firstName} {activePlayer().lastName}</strong></h1>
                        <img className="Image" src={getImage(activePlayer().personId)}></img>
                        <h1 className="Text">still in the league?</h1>
                    </div>

                    {answer ? (
                        <div className="Answer">
                            <h1 className="Text">{isCorrect() ? 'Right' : 'Wrong'}!</h1>

                            <div>
                                <button
                                    className="Button Button--next"
                                    onClick={e => nextPlayer()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g><path d="M0,0h24v24H0V0z" fill="none"/></g><g><polygon points="6.23,20.23 8,22 18,12 8,2 6.23,3.77 14.46,12"/></g></svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="Buttons">
                            <button
                                className="Button Button--yes"
                                onClick={e => setAnswer('yes')}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M9 21h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.58 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2zM9 9l4.34-4.34L12 10h9v2l-3 7H9V9zM1 9h4v12H1z"/></svg>
                            </button>

                            <button
                                className="Button Button--no"
                                onClick={e => setAnswer('no')}>
                                <svg xmlns="http://www.w3.org/2000/svg"viewBox="0 0 24 24"><path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm0 12l-4.34 4.34L12 14H3v-2l3-7h9v10zm4-12h4v12h-4z"/></svg>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
