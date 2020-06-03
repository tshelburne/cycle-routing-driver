import React from 'react'
import {expect} from 'chai'
import {stub} from 'sinon'
import {configure, shallow} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import {Router, Route, Link, useRoute} from '../../src/react/router'

describe(`react integration`, function() {

	before(function() {
		configure({ adapter: new Adapter() })
	})

	describe(`<Router />`, function() {

		it(`renders children`, function() {
			const wrapper = shallow(<Router><div /></Router>)
			expect(wrapper.html()).to.equal(`<div></div>`)
		})

		describe(`with useRoute`, function() {

			it(`provides the route data`, function() {
				const RouteUser = () => {
					const route = useRoute()

					return <div>{route.page}</div>
				}
				const wrapper = shallow(<Router route={{page: `page1`}}><RouteUser /></Router>)
				expect(wrapper.html()).to.equal(`<div>page1</div>`)
			})

		})

	})

	describe(`<Route />`, function() {

		it(`renders nothing when not matched`, function() {
			const wrapper = shallow(
				<Router route={{page: `none`, data: {}, query: {}}}>
					<Route match="page-match">
						<div>page match</div>
					</Route>
				</Router>
			)
			expect(wrapper.html()).to.equal(``)
		})

		it(`renders on a page match`, function() {
			const wrapper = shallow(
				<Router route={{page: `page-matchx`, data: {}, query: {}}}>
					<Route match="page-match1">
						<div>match 1</div>
					</Route>
					<Route match="page-match2">
						<div>match 2</div>
					</Route>
				</Router>
			)

			expect(wrapper.html()).to.equal(``)

			wrapper.setProps({route: {page: `page-match1`, data: {}, query: {}}})
			expect(wrapper.html()).to.equal(`<div>match 1</div>`)

			wrapper.setProps({route: {page: `page-match1.sub`, data: {}, query: {}}})
			expect(wrapper.html()).to.equal(`<div>match 1</div>`)

			wrapper.setProps({route: {page: `page-match2`, data: {}, query: {}}})
			expect(wrapper.html()).to.equal(`<div>match 2</div>`)

			wrapper.setProps({route: {page: `page-match2.sub`, data: {}, query: {}}})
			expect(wrapper.html()).to.equal(`<div>match 2</div>`)
		})

		it(`renders on a data match`, function() {
			const wrapper = shallow(
				<Router route={{page: `data-match`, data: {}, query: {}}}>
					<Route match={{page: `data-match`, data: {prop: true}}}>
						<div>match w/ true</div>
					</Route>
					<Route match={{page: `data-match`, data: {prop: false}}}>
						<div>match w/ false</div>
					</Route>
				</Router>
			)

			expect(wrapper.html()).to.equal(``)

			wrapper.setProps({route: {page: `data-matchx`, data: {prop: true}, query: {}}})
			expect(wrapper.html()).to.equal(``)

			wrapper.setProps({route: {page: `data-match`, data: {prop: true}, query: {}}})
			expect(wrapper.html()).to.equal(`<div>match w/ true</div>`)

			wrapper.setProps({route: {page: `data-match`, data: {prop: false}, query: {}}})
			expect(wrapper.html()).to.equal(`<div>match w/ false</div>`)
		})

		it(`renders on a query match`, function() {
			const wrapper = shallow(
				<Router route={{page: `query-match`, data: {}, query: {}}}>
					<Route match={{page: `query-match`, query: {prop: true}}}>
						<div>match w/ true</div>
					</Route>
					<Route match={{page: `query-match`, query: {prop: false}}}>
						<div>match w/ false</div>
					</Route>
				</Router>
			)

			expect(wrapper.html()).to.equal(``)

			wrapper.setProps({route: {page: `query-matchx`, data: {}, query: {prop: true}}})
			expect(wrapper.html()).to.equal(``)

			wrapper.setProps({route: {page: `query-match`, data: {}, query: {prop: true}}})
			expect(wrapper.html()).to.equal(`<div>match w/ true</div>`)

			wrapper.setProps({route: {page: `query-match`, data: {}, query: {prop: false}}})
			expect(wrapper.html()).to.equal(`<div>match w/ false</div>`)
		})

		it(`renders on a function match`, function() {
			const wrapper = shallow(
				<Router route={{page: `function-match`, data: {}, query: {}}}>
					<Route match={({data, query}) => (data.prop || query.prop) === `test`}>
						<div>match test</div>
					</Route>
				</Router>
			)

			expect(wrapper.html()).to.equal(``)

			wrapper.setProps({route: {page: `function-match-other`, data: {prop: `test`}, query: {}}})
			expect(wrapper.html()).to.equal(`<div>match test</div>`)

			wrapper.setProps({route: {page: `function-match-none`, data: {}, query: {prop: `test`}}})
			expect(wrapper.html()).to.equal(`<div>match test</div>`)
		})

	})

	describe(`<Link />`, function() {

		beforeEach(function() {
			this.toUrl = stub()
			this.toUrl.withArgs({page: `page1`}).returns(`/page1`)
			this.toUrl.withArgs({page: `page2`, data: {id: 1}}).returns(`/page2/1`)
			this.toUrl.withArgs({page: `page2`, data: {id: 5}}).returns(`/page2/5`)
			this.toUrl.withArgs({page: `page3`, query: {id: 1}}).returns(`/page3?id=1`)
			this.toUrl.withArgs({page: `page3`, query: {id: 5}}).returns(`/page3?id=5`)
			this.toUrl.withArgs({page: `page4`}).returns(`/page4`)
		})

		it(`renders a page link`, function() {
			const wrapper = shallow(<Router route={{page: `page4`, toUrl: this.toUrl}}>
				<Link to="page1">Page 1</Link>
			</Router>)

			expect(wrapper.html()).to.equal(`<a href="/page1">Page 1</a>`)
		})

		it(`renders a page / data link`, function() {
			const wrapper = shallow(<Router route={{page: `page4`, toUrl: this.toUrl}}>
				<Link to={{page: `page2`, data: {id: 1}}}>Page 2/1</Link>
				<Link to={{page: `page2`, data: {id: 5}}}>Page 2/5</Link>
			</Router>)

			expect(wrapper.html()).to.equal(`<a href="/page2/1">Page 2/1</a><a href="/page2/5">Page 2/5</a>`)
		})

		it(`renders a page / query link`, function() {
			const wrapper = shallow(<Router route={{page: `page4`, toUrl: this.toUrl}}>
				<Link to={{page: `page3`, query: {id: 1}}}>Page 3?1</Link>
				<Link to={{page: `page3`, query: {id: 5}}}>Page 3?5</Link>
			</Router>)

			expect(wrapper.html()).to.equal(`<a href="/page3?id=1">Page 3?1</a><a href="/page3?id=5">Page 3?5</a>`)
		})

		it(`renders an active link`, function() {
			const wrapper = shallow(<Router route={{page: `page4`, toUrl: this.toUrl}}>
				<Link className="test-link" activeClassName="test-active" to="page1">Page 1</Link>
				<Link className="test-link" activeClassName="test-active" to="page4">Page 4</Link>
			</Router>)

			expect(wrapper.html()).to.equal(`<a class="test-link" href="/page1">Page 1</a><a class="test-link test-active" href="/page4">Page 4</a>`)
		})

	})

})