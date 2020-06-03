import {expect} from 'chai'
import {createRouter, routes} from '../src/routing-driver'

describe(`routing driver`, function() {
	describe(`router#toUrl`, function() {
		beforeEach(createThisRouter)

		it(`handles an unknown path`, function() {
			expect(
				this.router.toUrl({
					page: `unknown`,
					data: {},
					query: {},
				})
			).to.equal(`/notfound`)
		})

		it(`handles a known string page`, function() {
			expect(
				this.router.toUrl({
					page: `simplest`,
					data: {},
					query: {},
				})
			).to.equal(`/simplest`)
		})

		it(`handles a known path-specified page`, function() {
			expect(
				this.router.toUrl({
					page: `simple`,
					data: {test: `value`},
					query: {},
				})
			).to.equal(`/path/to/whatever`)
		})

		it(`handles a known page with data`, function() {
			expect(
				this.router.toUrl({
					page: `single-param`,
					data: {data: `1234`},
					query: {},
				})
			).to.equal(`/path/to/1234`)
		})

		it(`handles a known page with mapped data`, function() {
			expect(
				this.router.toUrl({
					page: `single-param-mapped`,
					data: {data: {value: `1234`, other: `nothing`}},
					query: {},
				})
			).to.equal(`/path/to/mapped/1234`)
		})

		it(`handles a known page with multiple data values`, function() {
			expect(
				this.router.toUrl({
					page: `multiple-params`,
					data: {first: `1234`, second: `2345`},
					query: {},
				})
			).to.equal(`/path/to/1234/next/2345`)
		})

		it(`handles a known page with multiple mapped data values`, function() {
			expect(
				this.router.toUrl({
					page: `multiple-params-mapped`,
					data: {
						one: {oneValue: `1234`, prop1: null},
						two: {twoValue: `2345`, prop2: null},
					},
					query: {},
				})
			).to.equal(`/path/to/mapped/1234/next/2345`)
		})

		it(`adds a query string for query details`, function() {
			expect(
				this.router.toUrl({
					page: `simple`,
					data: {test: `value`},
					query: {modal: {name: `modal 1`, data: {some: `data`}}},
				})
			).to.equal(
				`/path/to/whatever?modal%5Bname%5D=modal%201&modal%5Bdata%5D%5Bsome%5D=data`
			)
		})

		describe(`sub-routing`, function() {
			it(`handles a string sub-page`, function() {
				expect(
					this.router.toUrl({
						page: `bottom.simplest`,
						data: {},
						query: {},
					})
				).to.equal(`/bottom/path/simplest`)
			})

			it(`handles redirecting an index`, function() {
				expect(
					this.router.toUrl({
						page: `bottom`,
						data: {},
						query: {},
					})
				).to.equal(`/bottom/path/simplest`)
			})

			it(`handles a path-specified sub-page with data`, function() {
				expect(
					this.router.toUrl({
						page: `bottom.next`,
						data: {},
						query: {},
					})
				).to.equal(`/bottom/path/next/path`)
			})

			it(`handles a path-specified sub-page with data`, function() {
				expect(
					this.router.toUrl({
						page: `bottom.next-data`,
						data: {one: {oneValue: `testing`}},
						query: {},
					})
				).to.equal(`/bottom/path/next/testing`)
			})

			it(`handles a path-specified nested string sub-page with data`, function() {
				expect(
					this.router.toUrl({
						page: `bottom.next-data.simplest`,
						data: {one: {oneValue: `testing`}},
						query: {},
					})
				).to.equal(`/bottom/path/next/testing/simplest`)
			})

			it(`handles a path-specified nested path-specified sub-page with data`, function() {
				expect(
					this.router.toUrl({
						page: `bottom.next-data.final`,
						data: {one: {oneValue: `testing`}},
						query: {},
					})
				).to.equal(`/bottom/path/next/testing/final/path`)
			})
		})
	})

	describe(`router#fromHistory`, function() {
		beforeEach(createThisRouter)

		it(`handles an unknown route`, function() {
			expect(
				this.router.fromHistory({
					pathname: `/unknown`,
					search: `?`,
				})
			).to.deep.equal({
				page: `404`,
				data: {},
				query: {},
			})
		})

		it(`handles a known string route`, function() {
			expect(
				this.router.fromHistory({
					pathname: `/simplest`,
					search: `?`,
				})
			).to.deep.equal({
				page: `simplest`,
				data: {},
				query: {},
			})
		})

		it(`handles a known path-specified route`, function() {
			expect(
				this.router.fromHistory({
					pathname: `/path/to/whatever`,
					search: `?`,
				})
			).to.deep.equal({
				page: `simple`,
				data: {},
				query: {},
			})
		})

		it(`handles a known route with a param`, function() {
			expect(
				this.router.fromHistory({
					pathname: `/path/to/1234`,
					search: `?`,
				})
			).to.deep.equal({
				page: `single-param`,
				data: {data: `1234`},
				query: {},
			})
		})

		it(`handles a known route with a special characters param`, function() {
			expect(
				this.router.fromHistory({
					pathname: `/path/to/_1.2-3~4`,
					search: `?`,
				})
			).to.deep.equal({
				page: `single-param`,
				data: {data: `_1.2-3~4`},
				query: {},
			})
		})

		it(`handles a known route with a mapped param`, function() {
			expect(
				this.router.fromHistory({
					pathname: `/path/to/mapped/1234`,
					search: `?`,
				})
			).to.deep.equal({
				page: `single-param-mapped`,
				data: {data: {value: `1234`, other: `something`}},
				query: {},
			})
		})

		it(`handles a known route with multiple params`, function() {
			expect(
				this.router.fromHistory({
					pathname: `/path/to/1234/next/2345`,
					search: `?`,
				})
			).to.deep.equal({
				page: `multiple-params`,
				data: {first: `1234`, second: `2345`},
				query: {},
			})
		})

		it(`handles a known route with multiple mapped params`, function() {
			expect(
				this.router.fromHistory({
					pathname: `/path/to/mapped/1234/next/2345`,
					search: `?`,
				})
			).to.deep.equal({
				page: `multiple-params-mapped`,
				data: {
					one: {oneValue: `1234`, prop1: `1`},
					two: {twoValue: `2345`, prop2: `2`},
				},
				query: {},
			})
		})

		it(`adds a query object for query details`, function() {
			expect(
				this.router.fromHistory({
					pathname: `/path/to/whatever`,
					search: `?modal%5Bname%5D=modal%201&modal%5Bdata%5D%5Bsome%5D=data`,
				})
			).to.deep.equal({
				page: `simple`,
				data: {},
				query: {modal: {name: `modal 1`, data: {some: `data`}}},
			})
		})

		describe(`sub-routing`, function() {
			it(`handles a string sub-route`, function() {
				expect(
					this.router.fromHistory({
						pathname: `/bottom/path/simplest`,
						search: ``,
					})
				).to.deep.equal({
					page: `bottom.simplest`,
					data: {},
					query: {},
				})
			})

			it(`handles a path-specified sub-route with data`, function() {
				expect(
					this.router.fromHistory({
						pathname: `/bottom/path/next/path`,
						search: ``,
					})
				).to.deep.equal({
					page: `bottom.next`,
					data: {},
					query: {},
				})
			})

			it(`handles a path-specified sub-route with data`, function() {
				expect(
					this.router.fromHistory({
						pathname: `/bottom/path/next/testing`,
						search: ``,
					})
				).to.deep.equal({
					page: `bottom.next-data`,
					data: {one: {oneValue: `testing`, prop1: `1`}},
					query: {},
				})
			})

			it(`handles a path-specified nested string sub-route with data`, function() {
				expect(
					this.router.fromHistory({
						pathname: `/bottom/path/next/testing/simplest`,
						search: ``,
					})
				).to.deep.equal({
					page: `bottom.next-data.simplest`,
					data: {one: {oneValue: `testing`, prop1: `1`}},
					query: {},
				})
			})

			it(`handles a path-specified nested path-specified sub-route with data`, function() {
				expect(
					this.router.fromHistory({
						pathname: `/bottom/path/next/testing/final/path`,
						search: ``,
					})
				).to.deep.equal({
					page: `bottom.next-data.final`,
					data: {one: {oneValue: `testing`, prop1: `1`}},
					query: {},
				})
			})
		})
	})

	function createThisRouter() {
		this.router = createRouter(
			routes`
			simplest
			simple (/path/to/whatever)
			single-param (/path/to/:data)
			single-param-mapped (/path/to/mapped/:data) ${{
				data: {
					toParam: data => data.value,
					toData: param => ({value: param, other: `something`}),
				},
			}}
			multiple-params (/path/to/:first/next/:second)
			multiple-params-mapped (/path/to/mapped/:one/next/:two) ${{
				two: {
					toParam: data => data.twoValue,
					toData: param => ({twoValue: param, prop2: `2`}),
				},
			}}
			bottom (/bottom/path) -> simplest
				simplest
				next (/next/path)
				next-data (/next/:one)
					simplest
					final (/final/path)
		`,
			{
				params: {
					one: {
						toParam: data => data.oneValue,
						toData: param => ({oneValue: param, prop1: `1`}),
					},
					two: {
						toParam: data => data.shouldNotShow,
						toData: param => ({shouldNotShow: param}),
					},
				},
			}
		)
	}
})

describe(`routes template`, function() {

	it(`handles failing case https://github.com/tshelburne/cycle-routing-driver/issues/7`, function() {
		const routing = routes`
			one
			two
				nested (/:nested) -> base
					base (/)
					second (/:second)
						third
			three
				nested (/nested/:nested) -> base
					base (/)
					second (/:second)
		`

		expect(routing).to.deep.equal([
			routeHelper({ page: `one` }),
			routeHelper({
				page: `two`,
				subs: [
					routeHelper({
						index: `base`,
						page: `nested`,
						path: `/:nested`,
						subs: [
							routeHelper({ page: `base`, path: `/` }),
							routeHelper({
								page: `second`,
								path: `/:second`,
								subs: [
									routeHelper({page: `third`})
								]
							}),
						]
					})
				]
			}),
			routeHelper({
				page: `three`,
				subs: [
					routeHelper({
						index: `base`,
						page: `nested`,
						path: `/nested/:nested`,
						subs: [
							routeHelper({ page: `base`, path: `/` }),
							routeHelper({ page: `second`, path: `/:second` }),
						]
					})
				]
			}),
		])
	})

	function routeHelper(spec) {
		return {
			index: undefined,
			page: undefined,
			params: undefined,
			path: undefined,
			subs: [],
			...spec,
		}
	}

})